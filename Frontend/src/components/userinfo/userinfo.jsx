import  { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const LinkedInCallback = ({ setUserProfile }) => {
    const query = useQuery();

    useEffect(() => {
        const accessToken = query.get('access_token');
        const userProfile = query.get('user_profile');

        if (accessToken && userProfile) {
            try {
                const decodedProfile = JSON.parse(decodeURIComponent(userProfile));
                setUserProfile(decodedProfile);
                console.log('LinkedIn profile set:', decodedProfile);
            } catch (error) {
                console.error('Error decoding LinkedIn profile:', error);
            }
        }
    }, [query, setUserProfile]);

    
};

export default LinkedInCallback;