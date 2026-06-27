import supabase from './db-client.js';

// Social Commerce Export API
// Exports products in Facebook/Instagram catalog format (CSV)
// Also generates WhatsApp product share links

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { store_id, format } = req.query;

      if (!store_id) return res.status(400).json({ error: 'store_id required' });

      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store_id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const { data: store } = await supabase
        .from('stores')
        .select('*')
        .eq('id', store_id).single();

      if (format === 'facebook_csv') {
        // Facebook Product Catalog CSV format
        const header = 'id,title,description,availability,condition,price,sale_price,link,image_link,brand,additional_image_link,product_type,google_product_category';
        const rows = (products || []).map(p => {
          const price = Number(p.price);
          const salePrice = p.mrp && Number(p.mrp) > price ? price : '';
          const availability = p.stock > 0 ? 'in stock' : 'out of stock';
          const link = `https://pasalnepal.com/store/${store?.subdomain || ''}`;
          return [
            p.id, p.name, (p.description || '').replace(/[,"]/g, ' '),
            availability, 'new',
            `${price} NPR`, salePrice ? `${salePrice} NPR` : '',
            link, p.image_url || '', store?.name || '', '',
            p.category || '', '',
          ].map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(',');
        });
        const csv = [header, ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="facebook_catalog_${store?.subdomain || 'store'}.csv"`);
        return res.status(200).send(csv);
      }

      if (format === 'instagram_caption') {
        // Generate Instagram-ready captions for each product
        const captions = (products || []).map(p => {
          const discount = p.mrp && Number(p.mrp) > Number(p.price)
            ? Math.round(((Number(p.mrp) - Number(p.price)) / Number(p.mrp)) * 100)
            : 0;
          return {
            product_id: p.id,
            name: p.name,
            caption: `🛍️ ${p.name}\n\n${discount > 0 ? `🔥 ${discount}% OFF! ` : ''}Price: रू${Number(p.price).toLocaleString('en-IN')}${p.mrp && Number(p.mrp) > Number(p.price) ? ` (was रू${Number(p.mrp).toLocaleString('en-IN')})` : ''}\n\n${p.description ? p.description.slice(0, 100) + '...' : ''}\n\n🛒 Order now: https://pasalnepal.com/product/${p.id}\n\n#PasalNepal #NepalShopping #${(p.category || 'shopping').replace(/\s/g, '')} #NepalEcommerce #ShopLocalNepal`,
            image_url: p.image_url,
            price: p.price,
          };
        });
        return res.status(200).json({ captions, store_name: store?.name });
      }

      if (format === 'whatsapp_links') {
        // Generate WhatsApp share links for each product
        const links = (products || []).map(p => {
          const text = `🛍️ Check out: ${p.name}\nPrice: रू${Number(p.price).toLocaleString('en-IN')}\n\nOrder here: https://pasalnepal.com/product/${p.id}`;
          return {
            product_id: p.id,
            name: p.name,
            whatsapp_url: `https://wa.me/?text=${encodeURIComponent(text)}`,
            image_url: p.image_url,
          };
        });
        return res.status(200).json({ links, store_name: store?.name });
      }

      // Default: return export options
      return res.status(200).json({
        store_name: store?.name,
        product_count: products?.length || 0,
        formats: [
          { id: 'facebook_csv', name: 'Facebook Product Catalog (CSV)', desc: 'Upload to Facebook Business Manager' },
          { id: 'instagram_caption', name: 'Instagram Captions', desc: 'Ready-to-post captions with hashtags' },
          { id: 'whatsapp_links', name: 'WhatsApp Share Links', desc: 'Direct product share links' },
        ],
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Social export API error:', err);
    res.status(500).json({ error: err.message });
  }
}
