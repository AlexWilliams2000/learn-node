function autocomplete(input, latInput, lngInput) {
  // console.log(input, latInput, lngInput);
  if (!input) return; // skip this function if there's no address on the page
  // Looks like I'll need a Google Maps API key for this to work, inc. setting up a billing account..
  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    // Below shows all data available on a given location from the maps API, inc. photo's address, lat/lng etc.
    console.log('-----');
    console.log(place);
    console.log('-----');
    // eslint compoains at this - non-functional since it's changing state of input variables, but we want to modify existing
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();

    const imageLink = place.photos[4].getUrl();

    const sampleImage = document.createElement('a');

    const text = document.createTextNode('Location Image link');
    sampleImage.appendChild(text);
    sampleImage.href = imageLink;

    const image = document.createElement('img');
    image.setAttribute('src', imageLink);
    image.setAttribute('height', '748');
    image.setAttribute('width', '1024');
    image.setAttribute('alt', 'This should show an image from your location');
    sampleImage.appendChild(image);
    
    document.body.appendChild(sampleImage);

    console.log(imageLink);

    console.log(`latInput.value is: ${latInput.value}`);
    console.log(`lngInput.value is: ${lngInput.value}`);
  });

  // If someone hits enter on the address field, don't submit the form
  input.on('keydown', (e) => {
    if (e.keyode === 13) e.preventDefault();
  });
}

export default autocomplete;
