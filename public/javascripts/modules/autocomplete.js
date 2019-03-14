function autocomplete(input, latInput, lngInput) {
  // console.log(input, latInput, lngInput);
  if (!input) return; // skip this function if there's no address on the page
  // Looks like I'll need a Google Maps API key for this to work, inc. setting up a billing account..
  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    // Below shows all data available on a given location from the maps API, inc. photo's address, lat/lng etc.
    console.log(place);
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });

  // If someone hits enter on the address field, don't submit the form
  input.on('keydown', (e) => {
    if (e.keyode === 13) e.preventDefault();
  });
}

export default autocomplete;
