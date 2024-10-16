
import { getUsersFromDB, updateUser } from '../DB/database.js';
import { getTrendingProfiles } from './trendingProfiles.js';

export const updatePoints = async () => {
    const users = await getUsersFromDB();
    const trendingProfiles = getTrendingProfiles(users); // Returns array with objects corresponding to all users' usernames and relative points

    users.forEach(user => { // Visits every single profile
        const userFormation = user.formation; // Gets array of formation for a user (username reference)

        userFormation.forEach(chosenProfile => { // Visits every choson profile in each users' formation
            trendingProfiles.forEach(trendingProfile => { // Visits every trending profile
                if (chosenProfile === trendingProfile.username && trendingProfile.points) { // Compares the formation to a trending profile
                    user.points += trendingProfile.points; // Updates user's points by adding the new points
                }
            });
        });
    });

    await updateUser(users); // Save updated users to the file
};