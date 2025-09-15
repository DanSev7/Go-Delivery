import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register the required components with ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReviewPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [positiveReviewsByDay, setPositiveReviewsByDay] = useState([]);
  const [negativeReviewsByDay, setNegativeReviewsByDay] = useState([]);
  const reviewsPerPage = 3;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/reviews'); // Update with your actual endpoint
        const allReviews = response.data;
        console.log("All Reviews : ", allReviews);

        // Categorize reviews
        const positives = allReviews.filter(review => review.rating >= 3);
        const negatives = allReviews.filter(review => review.rating < 3);

        // Aggregate reviews by day
        const positiveReviewsByDay = aggregateReviewsByDay(positives);
        const negativeReviewsByDay = aggregateReviewsByDay(negatives);

        setReviews(allReviews);
        setPositiveReviewsByDay(positiveReviewsByDay);
        setNegativeReviewsByDay(negativeReviewsByDay);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Aggregate reviews by day
  const aggregateReviewsByDay = (reviews) => {
    const data = [0, 0, 0, 0, 0, 0, 0]; // Assuming days are indexed from 0 (Sunday) to 6 (Saturday)
    reviews.forEach(review => {
      const date = new Date(review.created_at);
      const day = date.getDay();
      data[day] += 1;
    });
    return data;
  };

  // Calculate total pages
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  // Get current reviews
  const currentReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  // Data for Positive Reviews Bar Chart
  const positiveData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Positive',
        data: positiveReviewsByDay,
        backgroundColor: ['#4CAF50'],
      },
    ],
  };

  // Data for Negative Reviews Bar Chart
  const negativeData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Negative',
        data: negativeReviewsByDay,
        backgroundColor: ['#F44336'],
      },
    ],
  };

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="bg-white shadow-xl rounded-lg p-4 flex flex-col h-[330px]">
        <h2 className="text-xl font-semibold mb-2">Positive Reviews</h2>
        <Bar data={positiveData} />
      </div>
      <div className="bg-white shadow-xl rounded-lg p-4 h-[330px]">
        <h2 className="text-xl font-semibold mb-2">Negative Reviews</h2>
        <Bar data={negativeData} />
      </div>
      <div className="col-span-2 ">
        <h2 className="text-xl font-semibold mb-2">Recent Reviews</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 p-4">
            {currentReviews.map((review) => (
              <div key={review.id} className="w-80 p-4 border-2 bg-white rounded-lg shadow-xl">
                <div className="flex items-center mb-4">
                  <img
                    src={review.profileImage}
                    alt={review.customerName}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{review.customerName}</h3>
                  </div>
                </div>
                <hr className="mb-4" />
                <div className="flex items-center">
                  <img
                    src={review.foodImage}
                    alt={review.foodName}
                    className="w-16 h-16 rounded-lg mr-4"
                  />
                  <div>
                    <h4 className="text-md font-semibold">{review.foodName}</h4>
                    <p className="text-sm">{review.foodDescription}</p>
                    <p className="text-sm font-light text-gray-600">
                      Ordered on: {review.orderedDate}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center mt-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded-l-lg hover:bg-gray-300"
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="px-4 py-2 bg-gray-100">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-200 rounded-r-lg hover:bg-gray-300"
            onClick={() => handlePageChange('next')}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
