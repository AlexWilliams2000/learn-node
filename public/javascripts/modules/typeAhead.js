import { $$ } from './bling';
import dompurify from 'dompurify';

const axios = require('axios');

function searchResultsHTML(stores) {
  return stores.map(store => `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `
  ).join('');
}

function typeAhead(search) {
  if (!search) {
    return;
  }

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');
  
  searchInput.on('input', function() {
    // if there's no value, stop
    if (!this.value) {
      searchResults.style.display = 'none';
      return; // stop
    }

    searchResults.style.display = 'block';

    axios
      .get(`/api/v1/search?q=${this.value}`)
      .then((res) => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
          return;
        }
        // Tell user there are no results so far
        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for ${this.value} found!</div>`);
      })
      .catch((err) => {
        console.error(err);
      });
  });

  // My solution:

  // const highlightElem = (elem) => {
  //   elem.style.color = 'white';
  //   elem.style['background-color'] = 'blue';
  // }

  // const calculateNext = (current, length, increment) => {
  //   let next = current + increment;
  //   if (next < 0) {
  //     next = length - 1;
  //   } else if (next === length) {
  //     next = 0;
  //   }
  //   return next;
  // }

  // // Handle keyboard inputs
  // searchInput.on('keyup', (e) => {
  //   // if they aren't pressing up down or enter, ignore
  //   if (![38, 40, 13].includes(e.keyCode)) {
  //     return;
  //   }

  //   // 1. Get all search results
  //   const results = $$('.search__result');
  //   let currentSelection;

  //   // 2. Check for background colour being set, get nodelist element index if present
  //   results.forEach((elem, i) => {
  //     if (elem.attributes.style) {
  //       currentSelection = i;
  //       elem.removeAttribute('style');
  //     }
  //   });
        
  //   // 3. Cases:
  //   // - On up, uncolour elemnt and colour element above (or last if it's the first element) 
  //   // - On down, uncolour elemnt and colour element below (or first if it's the last element) 
  //   // - On enter, do nothing if no element has background colour,
  //   // or load store page otherwise (follow href) 
  //   const numberOfResults = results.length;
  //   let newSelection;
  //   if (currentSelection === undefined) {
  //     switch (e.keyCode) {
  //       case 38:
  //         // Up
  //         highlightElem(results[numberOfResults - 1]);
  //         break;
  //       case 40:
  //         // Down
  //         highlightElem(results[0]);
  //         break;
  //       case 13:
  //         // Enter
  //         // Do nothing since nothing is selected - send flash message too?
  //         // 'Select something first' or similar..
  //         break;
  //       default:
  //         // Shouldn't ever get here
  //     }
  //   } else if (e.keyCode === 13) {
  //     const storeLocation = results[currentSelection].attributes.href.value;
  //     window.location.assign(`${storeLocation}`);
  //   } else {
  //     if (e.keyCode === 38) {
  //       newSelection = calculateNext(currentSelection, numberOfResults, -1);
  //     } else {
  //       newSelection = calculateNext(currentSelection, numberOfResults, 1);
  //     }
  //     highlightElem(results[newSelection]);
  //   }
  // });

  // Model answer (apply an 'active' class instead of looking for styling...)

  // Handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // if they aren't pressing up down or enter, ignore
    if (![38, 40, 13].includes(e.keyCode)) {
      return;
    }
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      [next] = items;  // next = items[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
}

export default typeAhead;
