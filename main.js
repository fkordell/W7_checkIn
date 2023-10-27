document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("searchForm");
    const resultsDiv = document.getElementById("results");

    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const placeName = document.getElementById("placeName").value;
        resultsDiv.innerHTML = "";

        try {
            const placeData = await searchPlaceData(placeName);
            if (placeData) {
                displayPlaceData(placeData);
            } else {
                resultsDiv.innerHTML = "Place not found.";
            }
        } catch (error) {
            console.error("API request failed:", error);
            resultsDiv.innerHTML = "Error fetching data from iNaturalist API.";
        }
    });

    async function searchPlaceData(placeName) {
        const placesUrl = `https://api.inaturalist.org/v1/places/autocomplete?q=${placeName}`;
        const placesResponse = await fetch(placesUrl);

        if (placesResponse.ok) {
            const placesData = await placesResponse.json();
            if (placesData.results.length > 0) {
                const placeId = placesData.results[0].id;
                const identifications = await getIdentificationsByPlaceId(placeId);
                return { placeId, name: placesData.results[0].name, images: placesData.results[0].images, identifications };
            }
        }

        return null;
    }

    async function getIdentificationsByPlaceId(placeId) {
        const identificationsUrl = `https://api.inaturalist.org/v1/identifications?current=true&place_id=${placeId}&order=desc&order_by=created_at`; // Corrected the URL
        const identificationsResponse = await fetch(identificationsUrl);
        console.log("Identifications Response:", identificationsResponse);
        if (identificationsResponse.ok) {
            return await identificationsResponse.json();
        } else {
            throw new Error("API request failed");
        }
    }

    function displayPlaceData(placeData) {
        const ul = document.createElement("ul");
        const li = document.createElement("li");
        li.textContent = `Place Name: ${placeData.name}`;
        ul.appendChild(li);

        if (placeData.images && placeData.images.length > 0) {
            const imageList = document.createElement("ul");
            placeData.images.forEach(imageUrl => {
                const imageItem = document.createElement("li");
                const image = document.createElement("img");
                image.src = imageUrl;
                imageItem.appendChild(image);
                imageList.appendChild(imageItem);
            });
            ul.appendChild(imageList);
        }

        resultsDiv.appendChild(ul);

        displayImagesForIdentifications(placeData.identifications); // Display images related to identifications
    }

    function displayImagesForIdentifications(identifications) {
        const ul = document.createElement("ul");
    
        identifications.results.forEach(identification => {
            const defaultPhoto = identification.default_photo;
            console.log("defaultPhoto:", defaultPhoto);
            if (defaultPhoto && defaultPhoto.url) {
                const li = document.createElement("li");
                const image = document.createElement("img");
    
                // Display the image related to the identification's default_photo
                image.src = defaultPhoto.url;
                image.alt = defaultPhoto.attribution;
    
                li.appendChild(image);
                ul.appendChild(li);
            }
        });
    
        resultsDiv.appendChild(ul);
    }
    
});
