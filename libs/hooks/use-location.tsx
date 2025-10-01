import { useEffect } from "react";

import { useAIState } from '@ai-sdk/rsc';

import getLocationFromCoordinates from "@/server/get-location-from-coordinates";

export default function useLocation() {
  const [aiState, setAIState] = useAIState();

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser.");
      setAIState({
        ...aiState,
        location: {
          coordinates: null,
          isLoaded: true,
        },
      });
      return;
    }

    const options = {
      timeout: 5000, // Timeout after 5 seconds
    };

    const success = async (position: GeolocationPosition) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const response = await getLocationFromCoordinates({
        latitude: latitude,
        longitude: longitude,
      });
      const result = await response;
      if ("location" in result) {
        const locationName = result.location;
        const countryCode = result.countryCode;
        const location = {
          isLoaded: true,
          locationName: locationName,
          countryCode: countryCode,
          coordinates: {
            latitude: latitude,
            longitude: longitude,
          },
        };

        setAIState({
          ...aiState,
          location: location,
        });
      } else {
        console.error("Error fetching location: ", result.error);
        setAIState({
          ...aiState,
          location: {
            coordinates: null,
            isLoaded: true,
          },
        });
        return;
      }

      clearTimeout(timerId);
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "User denied the request for Geolocation.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "The request to get user location timed out.";
          break;
        default:
          errorMessage = "An unknown error occurred.";
          break;
      }
      console.error(errorMessage);
      setAIState({
        ...aiState,
        location: {
          ...aiState.location,
          isLoaded: true,
        },
      });
      clearTimeout(timerId);
    };

    const watchId = navigator.geolocation.getCurrentPosition(
      success,
      handleError,
      options,
    );

    // Set a timeout to handle the case where the user does not make a selection.
    const timerId = setTimeout(() => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (!aiState.location.isLoaded) {
        console.log("No response from user.");
        setAIState({
          ...aiState,
          location: {
            ...aiState.location,
            isLoaded: true,
          },
        });
      }
    }, 5000); // Timeout after 5 seconds

    return () => clearTimeout(timerId); // Clear the timeout if the component is unmounted.
  }, []);

  return {
    location: aiState.location.coordinates,
    isLoaded: aiState.location.isLoaded,
  };
}
