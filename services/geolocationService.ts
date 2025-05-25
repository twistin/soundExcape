// services/geolocationService.ts
interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  // Add other fields if needed, but for now, only lat and lon are used.
}

/**
 * Fetches coordinates (latitude and longitude) for a given location name
 * using the OpenStreetMap Nominatim API.
 * @param locationName The name of the location to geocode.
 * @returns A promise that resolves to an object with latitude and longitude, or null if an error occurs or no results are found.
 */
export async function getCoordinatesFromLocationName(
  locationName: string
): Promise<{ latitude: number; longitude: number } | null> {
  if (!locationName.trim()) {
    console.warn("Location name is empty, cannot geocode.");
    alert("Por favor, introduce un nombre de ubicación para buscar coordenadas.");
    return null;
  }

  const encodedLocation = encodeURIComponent(locationName);
  // IMPORTANT: For a real application, replace 'soundXcape_Dev_App/1.0' 
  // with a specific contact email or website as per Nominatim's usage policy.
  // This helps them contact you if there are issues with your requests.
  const userAgent = 'soundXcape_Dev_App/1.0 (Development Build; for app soundXcape)'; 
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1&addressdetails=0`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent, // Nominatim requires a User-Agent
      },
    });

    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status} ${response.statusText}. URL: ${url}`);
      const errorText = await response.text();
      console.error("Nominatim response body:", errorText)
      alert(`Error al contactar el servicio de geolocalización: ${response.statusText}. Por favor, inténtalo más tarde.`);
      return null;
    }

    const data: NominatimResult[] = await response.json();

    if (data && data.length > 0) {
      const firstResult = data[0];
      const lat = parseFloat(firstResult.lat);
      const lon = parseFloat(firstResult.lon);

      if (!isNaN(lat) && !isNaN(lon)) {
        return { latitude: lat, longitude: lon };
      } else {
        console.warn(`Invalid coordinates received from Nominatim for ${locationName}: lat=${firstResult.lat}, lon=${firstResult.lon}`);
        alert(`No se pudieron obtener coordenadas válidas para "${locationName}".`);
        return null;
      }
    }
    
    console.warn(`No coordinates found for location: ${locationName}`);
    alert(`No se encontraron coordenadas para "${locationName}". Intenta con un nombre de ubicación más específico o diferente.`);
    return null;
  } catch (error) {
    console.error("Error fetching coordinates from Nominatim:", error);
    alert(`Ocurrió un error al buscar las coordenadas: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}
