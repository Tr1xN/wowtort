import NodeGeocoder from 'node-geocoder';
const geocoder = NodeGeocoder({provider: 'openstreetmap'});

export async function reverseLocation(lat, lon){
    const loc = await geocoder.reverse({ lat: lat, lon: lon })
    return(loc[0].formattedAddress)
}

