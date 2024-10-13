const MAX = 10;
const scores = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];

// Handles the trending profiles based on current points in json file
export const getTopProfilesByPoints = (users) => {
    users.sort((a, b) => b.points - a.points);

    return users.slice(0, MAX);
}

// Gets the trending profiles based on the views etc
export const getTrendingProfiles = (users) => {
    let peopleInFormations = [], allObj = [], allObjects = [];
    let allPeopleNames = new Set();

    users.forEach(user => {
        let formation = user.formation;

        formation.forEach(chosen => {
            peopleInFormations.push(chosen); // Add the user to the array (with duplicates)
            allPeopleNames.add(chosen); // Add the user to the Set (only contains usernames once)
        });
    });

    Array.from(allPeopleNames).forEach(user => { // Visits all the usernames in others' formations
        let count = 1;
        
        peopleInFormations.forEach(people => { // Visits every single people in every single formation
            if (people === user) {
                count++;
            }
        });
        let object = {
            name: user,
            count: count
        };

        allObj.push(object);
    });

    let trendingProfiles = allObj.sort((a, b) => b.count - a.count).slice(0, MAX); // Gets first 10 trending profiles

    // Determinate the new points of this user based on its trending
    Array.from(trendingProfiles).forEach((profile, index) => {
        let object = {
            username: profile.name,
            points: scores[index], // Assigns certain points to every trending profile
        }

        allObjects.push(object);
    });

    return allObjects; // Returns the trending profiles
}