export const handleApiError = (error) => {
  if (error.response) {
    console.error('API Error:', error.response.data.message || 'Server error occurred');
    // Can add toast notifications here
  } else if (error.request) {
    console.error('Network Error:', 'Please check your internet connection');
  } else {
    console.error('Error:', error.message);
  }
};
