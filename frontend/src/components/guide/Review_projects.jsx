import React, { useEffect, useState } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

function Review_projects() {
  const guideRegNum = useSelector((state) => state.userSlice.reg_num);
  const [reviewRequests, setReviewRequests] = useState([]);

  useEffect(() => {
    const fetchAllReviewRequests = async () => {
      try {
        // Fetch guide review requests
        const guideRes = await instance.get(`/guide/fetch_review_requests/${guideRegNum}`);
        // Fetch subject expert review requests
        const subExpertRes = await instance.get(`/sub_expert/fetch_review_requests/${guideRegNum}`);

        // Combine both results (assuming both are arrays)
        const combinedResults = [...guideRes.data, ...subExpertRes.data];

        console.log('Combined Review Requests:', combinedResults);
        setReviewRequests(combinedResults);
      } catch (error) {
        console.error('Error fetching review requests:', error);
      }
    };

    if (guideRegNum) {
      fetchAllReviewRequests();
    }
  }, [guideRegNum]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Review Projects</h1>
      
    </div>
  );
}

export default Review_projects;
