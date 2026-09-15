import { NextRequest, NextResponse } from 'next/server';
import { getLocalMenu, serverStore } from '@/lib/serverStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { MenuItem } from '@/types/cafe';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const menuItems: MenuItem[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          description: row.description,
          detailedDescription: row.detailed_description,
          price: row.price,
          priceNumber: Number(row.price_number),
          image: row.image,
          calories: row.calories,
          dietary: row.dietary,
          tasteNotes: row.taste_notes,
          featured: row.featured,
          signature: row.signature,
          prepTime: row.prep_time,
          customizationOptions: row.customization_options,
          isAvailable: row.is_available,
          displayOrder: row.display_order,
        }));
        return NextResponse.json({ success: true, menu: menuItems });
      }
    }

    return NextResponse.json({ success: true, menu: getLocalMenu(), source: 'local' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const item = await req.json() as MenuItem;
    if (!item.name || !item.category || !item.priceNumber) {
      return NextResponse.json({ success: false, message: 'Missing required menu item fields' }, { status: 400 });
    }

    if (!item.id) {
      item.id = `menu-custom-${Date.now()}`;
    }

    serverStore.menu.push(item);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('menu_items').upsert({
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
        prep_time: item.prepTime || '10-15 min',
        customization_options: item.customizationOptions || {},
        is_available: item.isAvailable !== false,
        display_order: item.displayOrder || serverStore.menu.length,
      });
    }

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
