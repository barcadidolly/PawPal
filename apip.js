let displayedAnimalIds = new Set();
let currentPage = 1;

async function fetchAnimals() {
  try {
    const breed = document.getElementById('breed').value || 'Any';
    const apiUrl = `https://api.petfinder.com/v2/animals?type=dog${breed !== 'Any' ? `&breed=${breed}` : ''}&page=${currentPage}`;
    const accessToken = await authenticate();
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch animals');
    }

    const data = await response.json();
    filterAndDisplayAnimals(data.animals);

    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = data.pagination && !data.pagination._links.next;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error.message);
  }
}

function filterAndDisplayAnimals(animals) {
  const uniqueAnimals = animals.filter(animal => !displayedAnimalIds.has(animal.id));
  displayAnimals(uniqueAnimals);
  uniqueAnimals.forEach(animal => displayedAnimalIds.add(animal.id));
}

function displayAnimals(animals) {
  const dogsContainer = document.getElementById('dogsContainer');

  if (currentPage === 1) {
    dogsContainer.innerHTML = ''; // Clear previous content if it's the first page
  }

  if (animals.length === 0) {
    dogsContainer.innerHTML += '<p>No more animals found.</p>';
    return;
  }

  const skillsDiv = document.createElement('div');
  skillsDiv.classList.add('skills');

  for (let i = 0; i < animals.length; i += 3) {
    const skillRow = document.createElement('div');
    skillRow.classList.add('skill-row');

    for (let j = i; j < i + 3 && j < animals.length; j++) {
      const animal = animals[j];
      const animalColumn = document.createElement('div');
      animalColumn.classList.add('animal-column');
      animalColumn.innerHTML = `
        <img src="${animal.photos && animal.photos.length > 0 ? animal.photos[0].medium : 'placeholder.jpg'}" alt="${animal.name}">
        <b><h3>${animal.name}</h3></b>
        <p>${animal.description ? animal.description : 'No description available'}</p>
      `;
      skillRow.appendChild(animalColumn);
    }

    skillsDiv.appendChild(skillRow);
  }

  dogsContainer.appendChild(skillsDiv);

  // Increment the current page for the next fetch
  currentPage++;
}

async function authenticate() {
  try {
    const clientID = 'z6K15qyGv1skNKPPaVTtruLKKOxsAAGGBbv90lvZ1Ayf2Hrwfo';
    const clientSecret = 'tQM387DOlRciLg6ko5kJMVkAs3dCEJOXnGXJmooh';
    const tokenUrl = `https://api.petfinder.com/v2/oauth2/token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=client_credentials&client_id=${clientID}&client_secret=${clientSecret}`
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    throw new Error('Authentication failed');
  }
}

document.getElementById('searchButton').addEventListener('click', () => {
  currentPage = 1;
  displayedAnimalIds.clear();
  fetchAnimals();
});

document.getElementById('nextPageBtn').addEventListener('click', () => {
  currentPage++;
  fetchAnimals();
});

document.getElementById('prevPageBtn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchAnimals();
  }
});
