/**
 * Address autocomplete using LocationIQ
 * Restricted to South Africa
 */

export async function searchAddresses(query, country = 'South Africa') {
  if (!query || query.length < 3) {
    return [];
  }

  const locationiqToken = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN;
  
  if (!locationiqToken) {
    console.error('LocationIQ token not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/autocomplete.php?` +
      `key=${locationiqToken}&` +
      `q=${encodeURIComponent(query)}&` +
      `countrycodes=za&` +
      `format=json&` +
      `limit=10`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch addresses from LocationIQ');
    }

    const results = await response.json();

    if (!Array.isArray(results)) {
      return [];
    }

    // Map LocationIQ results to our format
    return results.map((result) => ({
      label: result.display_name,
      value: result.display_name,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      address: result,
    }));
  } catch (error) {
    console.error('Address autocomplete error:', error);
    return [];
  }
}

/**
 * Extract city, province, and zip from LocationIQ address components
 */
export function extractAddressComponents(address) {
  const components = {
    address: address, // Keep the full address with street number
    city: '',
    province: '',
    zipCode: '',
    country: 'South Africa',
  };

  // LocationIQ returns address as string, we need to parse it
  // Format typically: street, suburb/town, district, province, postal_code, country
  const parts = address.split(',').map(p => p.trim());

  // Map of province names to standardized names
  const provinceMap = {
    'gauteng': 'Gauteng',
    'western cape': 'Western Cape',
    'kwazulu-natal': 'KwaZulu-Natal',
    'kwazulu natal': 'KwaZulu-Natal',
    'eastern cape': 'Eastern Cape',
    'free state': 'Free State',
    'limpopo': 'Limpopo',
    'mpumalanga': 'Mpumalanga',
    'northern cape': 'Northern Cape',
    'north west': 'North West',
    'northwest': 'North West',
  };

  // Extract province, city, and postal code from address parts
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].toLowerCase().trim();
    
    // Check for province
    for (const [key, value] of Object.entries(provinceMap)) {
      if (part.includes(key)) {
        components.province = value;
        break;
      }
    }
    
    // Check for postal code (4 digits)
    if (/^\d{4}$/.test(parts[i])) {
      components.zipCode = parts[i];
    }
    
    // Extract city (usually appears before province)
    if (!components.city && i > 0 && i < parts.length - 1) {
      // Skip if it's a number or province
      if (!/^\d/.test(parts[i]) && !part.includes('south africa')) {
        let isProvince = false;
        for (const key of Object.keys(provinceMap)) {
          if (part.includes(key)) {
            isProvince = true;
            break;
          }
        }
        if (!isProvince && !/^\d{4}$/.test(parts[i])) {
          components.city = parts[i];
        }
      }
    }
  }

  return components;
}
