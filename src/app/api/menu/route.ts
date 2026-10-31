import { NextRequest, NextResponse } from 'next/server';
import { getLocalMenu, serverStore, updateLocalMenuItem, setLocalMenu } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '@/lib/supabase';
import { MenuItem } from '@/types/cafe';
import { INITIAL_MENU_ITEMS } from '@/data/cafeData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function cleanStockDescription(desc: string | undefined, isAvailable: boolean): string {
  if (!desc) return '';
  if (isAvailable) {
    return desc
      .replace(/\s*\(Currently Out of Stock\)/gi, '')
      .replace(/\s*Currently out of stock\./gi, '')
      .replace(/\s*\(Out of Stock\)/gi, '')
      .trim();
  }
  return desc;
}

function formatRowToMenuItem(row: any): MenuItem {
  const isAvailable = Boolean(row.is_available);
  let prepTime = row.prep_time || (row.category === 'Organic Milk' ? 'Farm Dispatched' : 'Farm Fresh');
  if (isAvailable && prepTime === 'Out of Stock') {
    prepTime = row.category === 'Organic Milk' ? 'Farm Dispatched' : 'Farm Fresh';
  } else if (!isAvailable && (prepTime === 'Farm Fresh' || prepTime === 'Farm Dispatched')) {
    prepTime = 'Out of Stock';
  }

  // Fallback to default catalog price if database price_number was corrupted to 0
  let priceNumber = Number(row.price_number);
  let price = row.price;
  if (!priceNumber || priceNumber <= 0) {
    const defaultCatalogItem = INITIAL_MENU_ITEMS.find((m) => m.id === row.id);
    if (defaultCatalogItem && defaultCatalogItem.priceNumber > 0) {
      priceNumber = defaultCatalogItem.priceNumber;
      price = defaultCatalogItem.price;
    }
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: cleanStockDescription(row.description || '', isAvailable),
    detailedDescription: cleanStockDescription(row.detailed_description || '', isAvailable) || undefined,
    price: price || `₹${priceNumber}`,
    priceNumber: priceNumber,
    image: row.image || '',
    calories: row.calories ? Number(row.calories) : undefined,
    dietary: row.dietary || 'veg',
    tasteNotes: row.taste_notes || [],
    featured: Boolean(row.featured),
    signature: Boolean(row.signature),
    prepTime,
    customizationOptions: row.customization_options || {},
    isAvailable,
    displayOrder: row.display_order ?? 0,
  };
}

function updatePortionPrices(
  customizationOptions: any,
  oldPriceNumber: number,
  newPriceNumber: number
) {
  if (!customizationOptions || !Array.isArray(customizationOptions.portion)) {
    return customizationOptions;
  }
  const updatedPortions = customizationOptions.portion.map((p: string) => {
    if (p.includes(`₹${oldPriceNumber}`)) {
      return p.replace(`₹${oldPriceNumber}`, `₹${newPriceNumber}`);
    }
    if (customizationOptions.portion.length === 1 && /\(₹\d+\)/.test(p)) {
      return p.replace(/\(₹\d+\)/, `(₹${newPriceNumber})`);
    }
    return p;
  });
  return {
    ...customizationOptions,
    portion: updatedPortions,
  };
}

export async function GET() {
  try {
    const client = supabaseAdmin || supabase;

    if (isSupabaseConfigured && client) {
      const { data, error } = await client
        .from('menu_items')
        .select('*')
        .order('display_order', { ascending: true });

      // If database table is empty or error occurred, seed initial items into database
      if (!error && (!data || data.length === 0)) {
        const seedRows = INITIAL_MENU_ITEMS.map((item, idx) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          description: item.description,
          detailed_description: item.detailedDescription || null,
          price: item.price,
          price_number: item.priceNumber,
          image: item.image,
          calories: item.calories || null,
          dietary: item.dietary || 'veg',
          taste_notes: item.tasteNotes || [],
          featured: item.featured || false,
          signature: item.signature || false,
          prep_time: item.prepTime || 'Farm Fresh',
          customization_options: item.customizationOptions || {},
          is_available: item.isAvailable !== false,
          display_order: item.displayOrder ?? idx + 1,
        }));

        const seedRes = await client.from('menu_items').insert(seedRows).select('*');
        if (!seedRes.error && seedRes.data && seedRes.data.length > 0) {
          const menuItems = seedRes.data.map(formatRowToMenuItem);
          setLocalMenu(menuItems);
          return NextResponse.json({ success: true, menu: menuItems, seeded: true, source: 'supabase' });
        }
      }

      if (!error && data && data.length > 0) {
        const menuItems: MenuItem[] = data.map(formatRowToMenuItem);
        setLocalMenu(menuItems);
        return NextResponse.json({ success: true, menu: menuItems, count: menuItems.length, source: 'supabase' });
      }
    }

    return NextResponse.json({ success: true, menu: getLocalMenu(), source: 'local' });
  } catch (error: any) {
    console.error('Menu GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const client = supabaseAdmin || supabase;

    // Support single item update or bulk items update
    const itemsToUpdate: Array<{
      id: string;
      priceNumber?: number;
      price?: string;
      isAvailable?: boolean;
      prepTime?: string;
      customizationOptions?: any;
    }> = Array.isArray(body.items) ? body.items : [body];

    if (!itemsToUpdate || itemsToUpdate.length === 0 || !itemsToUpdate[0]?.id) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload: item ID is required' },
        { status: 400 }
      );
    }

    const updatedResults: MenuItem[] = [];

    for (const update of itemsToUpdate) {
      if (!update.id) continue;

      // Find current item in memory to merge
      const defaultItem = INITIAL_MENU_ITEMS.find((m) => m.id === update.id);
      const existing = serverStore.menu.find((m) => m.id === update.id) || defaultItem;

      const oldPriceNumber = existing?.priceNumber || defaultItem?.priceNumber || 0;
      const newPriceNumber =
        typeof update.priceNumber === 'number'
          ? Math.max(0, update.priceNumber)
          : (existing?.priceNumber && existing.priceNumber > 0
              ? existing.priceNumber
              : defaultItem?.priceNumber ?? 0);

      const newPriceStr =
        update.price !== undefined
          ? update.price.trim().startsWith('₹')
            ? update.price.trim()
            : `₹${update.price.trim()}`
          : (existing?.price && existing.price !== '₹0'
              ? existing.price
              : defaultItem?.price || `₹${newPriceNumber}`);

      const newIsAvailable =
        update.isAvailable !== undefined
          ? Boolean(update.isAvailable)
          : existing?.isAvailable ?? true;

      // Intelligent portion option price sync
      let newCustomizationOptions = update.customizationOptions !== undefined
        ? update.customizationOptions
        : existing?.customizationOptions || defaultItem?.customizationOptions;

      if (newPriceNumber !== oldPriceNumber && newCustomizationOptions) {
        newCustomizationOptions = updatePortionPrices(
          newCustomizationOptions,
          oldPriceNumber,
          newPriceNumber
        );
      }

      // Default prep time update if availability toggles
      let newPrepTime = update.prepTime || existing?.prepTime;
      if (!newIsAvailable && (!newPrepTime || newPrepTime === 'Farm Fresh' || newPrepTime === 'Farm Dispatched')) {
        newPrepTime = 'Out of Stock';
      } else if (newIsAvailable && (newPrepTime === 'Out of Stock' || !newPrepTime)) {
        newPrepTime = (existing?.category === 'Organic Milk' || defaultItem?.category === 'Organic Milk')
          ? 'Farm Dispatched'
          : 'Farm Fresh';
      }

      // Automatically clean out-of-stock messages from description when in stock
      const baseDesc = existing?.description || defaultItem?.description || '';
      const baseDetailedDesc = existing?.detailedDescription || defaultItem?.detailedDescription || '';
      const cleanDesc = cleanStockDescription(baseDesc, newIsAvailable);
      const cleanDetailedDesc = cleanStockDescription(baseDetailedDesc, newIsAvailable);

      const mergedItem: MenuItem = {
        ...(defaultItem || {
          id: update.id,
          name: update.id,
          category: 'Farm Goods',
          description: cleanDesc,
          detailedDescription: cleanDetailedDesc,
          dietary: 'veg',
          image: '',
        }),
        ...(existing || {}),
        description: cleanDesc,
        detailedDescription: cleanDetailedDesc,
        priceNumber: newPriceNumber,
        price: newPriceStr,
        isAvailable: newIsAvailable,
        prepTime: newPrepTime,
        customizationOptions: newCustomizationOptions,
      };

      // 1. Update in-memory server store
      updateLocalMenuItem(update.id, mergedItem);
      updatedResults.push(mergedItem);

      // 2. Persist to Supabase Database
      if (isSupabaseConfigured && client) {
        const dbFields: any = {
          is_available: newIsAvailable,
          prep_time: newPrepTime,
          description: cleanDesc,
          detailed_description: cleanDetailedDesc || null,
          updated_at: new Date().toISOString(),
        };

        // Only overwrite prices in DB if explicitly provided in update payload
        if (update.priceNumber !== undefined || update.price !== undefined) {
          dbFields.price = newPriceStr;
          dbFields.price_number = newPriceNumber;
          if (newCustomizationOptions) {
            dbFields.customization_options = newCustomizationOptions;
          }
        }

        const { error: dbErr } = await client
          .from('menu_items')
          .update(dbFields)
          .eq('id', update.id);

        if (dbErr) {
          console.warn(`Supabase update error for ${update.id}:`, dbErr.message);
          // If the row didn't exist in Supabase yet, upsert the full item
          await client.from('menu_items').upsert({
            id: mergedItem.id,
            name: mergedItem.name,
            category: mergedItem.category,
            description: cleanDesc,
            detailed_description: cleanDetailedDesc || null,
            price: mergedItem.price,
            price_number: mergedItem.priceNumber,
            image: mergedItem.image,
            calories: mergedItem.calories || null,
            dietary: mergedItem.dietary || 'veg',
            taste_notes: mergedItem.tasteNotes || [],
            featured: mergedItem.featured || false,
            signature: mergedItem.signature || false,
            prep_time: mergedItem.prepTime || 'Farm Fresh',
            customization_options: mergedItem.customizationOptions || {},
            is_available: mergedItem.isAvailable,
            display_order: mergedItem.displayOrder ?? 0,
            updated_at: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product price and stock availability successfully updated and stored in database',
      updated: updatedResults.length === 1 ? updatedResults[0] : updatedResults,
      count: updatedResults.length,
    });
  } catch (error: any) {
    console.error('Menu PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const item = (await req.json()) as MenuItem;
    if (!item.name || !item.category || item.priceNumber === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required menu item fields (name, category, priceNumber)' },
        { status: 400 }
      );
    }

    if (!item.id) {
      item.id = `menu-custom-${Date.now()}`;
    }

    if (!item.price) {
      item.price = `₹${item.priceNumber}`;
    }

    // Update server store
    const existingIdx = serverStore.menu.findIndex((m) => m.id === item.id);
    if (existingIdx > -1) {
      serverStore.menu[existingIdx] = item;
    } else {
      serverStore.menu.push(item);
    }

    const client = supabaseAdmin || supabase;
    if (isSupabaseConfigured && client) {
      await client.from('menu_items').upsert({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        detailed_description: item.detailedDescription,
        price: item.price,
        price_number: item.priceNumber,
        image: item.image,
        calories: item.calories,
        dietary: item.dietary,
        taste_notes: item.tasteNotes || [],
        featured: item.featured || false,
        signature: item.signature || false,
        prep_time: item.prepTime || 'Farm Fresh',
        customization_options: item.customizationOptions || {},
        is_available: item.isAvailable !== false,
        display_order: item.displayOrder || serverStore.menu.length,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
