import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { ArrowLeft, User, Users, Calendar, BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';
import instance from '../../utils/axiosInstance';

function Admin_Dashboard() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [challengeReviews, setChallengeReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [subjectExperts, setSubjectExperts] = useState([]);
  const [guides, setGuides] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState('');
  const [selectedGuide, setSelectedGuide] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expertSearchTerm, setExpertSearchTerm] = useState('');
  const [guideSearchTerm, setGuideSearchTerm] = useState('');
  const [showExpertList, setShowExpertList] = useState(false);
  const [showGuideList, setShowGuideList] = useState(false);
  const [expertsPerPage] = useState(20);
  const [guidesPerPage] = useState(20);
  const [expertCurrentPage, setExpertCurrentPage] = useState(1);
  const [guideCurrentPage, setGuideCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  useEffect(() => {
    instance.get("/admin/get_all_projects")
      .then((res) => {
        setTeams(res.data);
        console.log(res.data);
      })
  }, []);

  useEffect(() => {
    instance.get('/teacher/getprojects')
      .then((res) => {
        setProjects(res.data);
        console.log('Fetched Projects:', res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch projects:', err);
      });
  }, []);

  // Fetch challenge reviews
  useEffect(() => {
    fetchChallengeReviews();
  }, []);

  const fetchChallengeReviews = () => {
    setLoading(true);
    // Replace with your actual API endpoint
    instance.get('/admin/get_challenge_reviews')
      .then((res) => {
        setChallengeReviews(res.data);
        console.log('Fetched Challenge Reviews:', res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch challenge reviews:', err);
        // Mock data for demonstration
        setChallengeReviews([
          { id: 1, student_name: 'John Doe', reg_no: 'CS21001', challenge_title: 'React Component Challenge', submitted_date: '2024-06-01', status: 'pending' },
          { id: 2, student_name: 'Jane Smith', reg_no: 'CS21002', challenge_title: 'Algorithm Optimization', submitted_date: '2024-06-02', status: 'pending' },
          { id: 3, student_name: 'Mike Johnson', reg_no: 'CS21003', challenge_title: 'Database Design', submitted_date: '2024-06-02', status: 'pending' },
          // Add more mock data to test pagination
          ...Array.from({ length: 47 }, (_, i) => ({
            id: i + 4,
            student_name: `Student ${i + 4}`,
            reg_no: `CS210${String(i + 4).padStart(2, '0')}`,
            challenge_title: `Challenge ${i + 4}`,
            submitted_date: '2024-06-03',
            status: 'pending'
          }))
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch reviewers when component mounts
  useEffect(() => {
    fetchReviewers();
  }, []);

  const fetchReviewers = async () => {
    try {
      // Fetch subject experts
      const expertsResponse = await instance.get('/admin/get_subject_experts');
      setSubjectExperts(expertsResponse.data);

      // Fetch guides
      const guidesResponse = await instance.get('/admin/get_guides');
      setGuides(guidesResponse.data);
    } catch (error) {
      console.error('Failed to fetch reviewers:', error);
      // Mock data for demonstration
      setSubjectExperts([
        { id: 1, name: 'Dr. Smith Johnson', expertise: 'React & Frontend Development', email: 'smith@university.edu' },
        { id: 2, name: 'Prof. Emily Davis', expertise: 'Algorithm Design', email: 'emily@university.edu' },
        { id: 3, name: 'Dr. Michael Brown', expertise: 'Database Systems', email: 'michael@university.edu' },
        { id: 4, name: 'Prof. Sarah Wilson', expertise: 'Software Engineering', email: 'sarah@university.edu' },
      ]);
      
      setGuides([
        { id: 1, name: 'Dr. Robert Taylor', department: 'Computer Science', email: 'robert@university.edu' },
        { id: 2, name: 'Prof. Lisa Anderson', department: 'Information Technology', email: 'lisa@university.edu' },
        { id: 3, name: 'Dr. James Martinez', department: 'Software Engineering', email: 'james@university.edu' },
        { id: 4, name: 'Prof. Jennifer Garcia', department: 'Data Science', email: 'jennifer@university.edu' },
      ]);
    }
  };

  const handleApproveReview = (review) => {
    setSelectedReview(review);
    setSelectedExpert('');
    setSelectedGuide('');
    setExpertSearchTerm('');
    setGuideSearchTerm('');
    setShowExpertList(false);
    setShowGuideList(false);
    setExpertCurrentPage(1);
    setGuideCurrentPage(1);
    setShowExpertList(false);
    setShowGuideList(false);
    setExpertCurrentPage(1);
    setGuideCurrentPage(1);
  };

  const handleBackToList = () => {
    setSelectedReview(null);
    setSelectedExpert('');
    setSelectedGuide('');
    setExpertSearchTerm('');
    setGuideSearchTerm('');
  };

  const handleAssignReviewers = async () => {
    if (!selectedExpert || !selectedGuide) {
      alert('Please select both Subject Expert and Guide');
      return;
    }

    setSubmitting(true);
    try {
      await instance.post('/admin/assign_reviewers', {
        review_id: selectedReview.id,
        subject_expert_id: selectedExpert,
        guide_id: selectedGuide,
        action: 'approve'
      });

      // Update local state
      setChallengeReviews(prev =>
        prev.map(review =>
          review.id === selectedReview.id
            ? { ...review, status: 'approved' }
            : review
        )
      );

      alert('Reviewers assigned successfully!');
      handleBackToList();
    } catch (error) {
      console.error('Failed to assign reviewers:', error);
      alert('Failed to assign reviewers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectReview = async (reviewId) => {
    try {
      setLoading(true);
      await instance.post('/admin/review_challenge', {
        review_id: reviewId,
        action: 'reject'
      });

      // Update local state
      setChallengeReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? { ...review, status: 'rejected' }
            : review
        )
      );

      console.log(`Review ${reviewId} rejected successfully`);
    } catch (err) {
      console.error('Failed to reject review:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter functions for search with memoization
  const filteredExperts = useMemo(() => {
    return subjectExperts.filter(expert =>
      expert.name.toLowerCase().includes(expertSearchTerm.toLowerCase()) ||
      expert.expertise.toLowerCase().includes(expertSearchTerm.toLowerCase()) ||
      expert.email.toLowerCase().includes(expertSearchTerm.toLowerCase())
    );
  }, [subjectExperts, expertSearchTerm]);

  const filteredGuides = useMemo(() => {
    return guides.filter(guide =>
      guide.name.toLowerCase().includes(guideSearchTerm.toLowerCase()) ||
      guide.department.toLowerCase().includes(guideSearchTerm.toLowerCase()) ||
      guide.email.toLowerCase().includes(guideSearchTerm.toLowerCase())
    );
  }, [guides, guideSearchTerm]);

  // Pagination for filtered results
  const paginatedExperts = useMemo(() => {
    const startIndex = (expertCurrentPage - 1) * expertsPerPage;
    return filteredExperts.slice(startIndex, startIndex + expertsPerPage);
  }, [filteredExperts, expertCurrentPage, expertsPerPage]);

  const paginatedGuides = useMemo(() => {
    const startIndex = (guideCurrentPage - 1) * guidesPerPage;
    return filteredGuides.slice(startIndex, startIndex + guidesPerPage);
  }, [filteredGuides, guideCurrentPage, guidesPerPage]);

  const expertTotalPages = Math.ceil(filteredExperts.length / expertsPerPage);
  const guideTotalPages = Math.ceil(filteredGuides.length / guidesPerPage);

  // Reset page when search changes
  useEffect(() => {
    setExpertCurrentPage(1);
  }, [expertSearchTerm]);

  useEffect(() => {
    setGuideCurrentPage(1);
  }, [guideSearchTerm]);

  // Get selected expert/guide names for display
  const selectedExpertName = subjectExperts.find(expert => expert.id === selectedExpert)?.name || '';
  const selectedGuideName = guides.find(guide => guide.id === selectedGuide)?.name || '';

  const teamIdCount = {};

  teams.forEach((team) => {
    const id = team.team_id;
    if (id) {
      teamIdCount[id] = (teamIdCount[id] || 0) + 1;
    }
  });

  let soloTeams = 0;
  let duoTeams = 0;
  let trioTeams = 0;
  let squadTeams = 0;

  Object.values(teamIdCount).forEach((count) => {
    if (count === 1) soloTeams++;
    else if (count === 2) duoTeams++;
    else if (count === 3) trioTeams++;
    else if (count === 4) squadTeams++;
  });

  const stats = [
    { title: 'Total Teams', value: soloTeams + duoTeams + trioTeams + squadTeams },
    { title: 'Solo Teams', value: soloTeams },
    { title: 'Duo Teams', value: duoTeams },
    { title: 'Trio Teams', value: trioTeams },
    { title: 'Squad Teams', value: squadTeams },
  ];

  const upcoming = [...projects]
    .filter((t) => t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 2)
    .map((t) => ({
      name: t.team_name,
      deadline: t.deadline,
    }));

  const activity = [...projects]
    .filter((t) => t.posted_date)
    .sort((a, b) => new Date(b.posted_date) - new Date(a.posted_date))
    .slice(0, 3)
    .map(
      (t) =>
        `Team "${t.project_name}" was posted on ${new Date(
          t.posted_date
        ).toLocaleDateString()}.`
    );

  // Pagination logic
  const pendingReviews = challengeReviews.filter(review => review.status === 'pending');
  const totalPages = Math.ceil(pendingReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const currentReviews = pendingReviews.slice(startIndex, startIndex + reviewsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Assignment View
  if (selectedReview) {
    return (
      <div className="p-6 rounded-xl h-[90%]">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-300 transition-colors duration-200 mb-6"
            >
              <ArrowLeft size={18} className='bg-white'/>
              Back to Dashboard
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Assign Reviewers</h1>
              <div className="w-16 h-0.5 bg-gray-400 mx-auto"></div>
            </div>
          </div>

          {/* Challenge Review Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="bg-white p-6 border-b border-gray-200">
              <h2 className="bg-white text-2xl font-bold text-gray-800 mb-3">Challenge Review Details</h2>
              <div className="bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white">
                  <p className="bg-white text-sm text-gray-600">Student Name</p>
                  <p className="bg-white font-medium text-gray-800">{selectedReview.student_name}</p>
                </div>
                <div className="bg-white">
                  <p className="bg-white text-sm text-gray-600">Registration Number</p>
                  <p className="bg-white font-medium text-gray-800">{selectedReview.reg_no}</p>
                </div>
                <div className="bg-white">
                  <p className="bg-white text-sm text-gray-600">Project Name</p>
                  <p className="bg-white font-medium text-gray-800">{selectedReview.challenge_title}</p>
                </div>
                <div className="bg-white">
                  <p className="bg-white text-sm text-gray-600">Submitted Date</p>
                  <p className="bg-white font-medium text-gray-800">
                    {new Date(selectedReview.submitted_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="bg-white space-y-8">
              {/* Subject Expert Selection */}
              <div>
                <div className="bg-white flex items-center gap-2 ">
                  <User className="bg-white text-gray-600" size={20} />
                  <h3 className="bg-white text-xl font-semibold text-gray-800">Select Subject Expert</h3>
                  <span className="bg-white text-sm text-gray-500">({subjectExperts.length} available)</span>
                </div>
                
                {/* Selected Expert Display */}
                {selectedExpert && (
                  <div className="bg-white p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="bg-white text-sm text-blue-600 mb-1">Selected Expert:</p>
                    <p className="bg-white font-medium text-blue-800">{selectedExpertName}</p>
                  </div>
                )}

                {/* Search Bar and Toggle */}
                <div className="bg-white space-y-3 ">
                  <div className="bg-white relative">
                    <Search className="bg-white absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by name, expertise, or email..."
                      value={expertSearchTerm}
                      onChange={(e) => setExpertSearchTerm(e.target.value)}
                      onFocus={() => setShowExpertList(true)}
                      className="bg-white w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowExpertList(!showExpertList)}
                    className="bg-white flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showExpertList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {showExpertList ? 'Hide' : 'Show'} Expert List 
                    {expertSearchTerm && `(${filteredExperts.length} found)`}
                  </button>
                </div>

                {/* Experts List */}
                {showExpertList && (
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="bg-white max-h-80 overflow-y-auto p-4">
                      {paginatedExperts.length > 0 ? (
                        <>
                          <div className="bg-white grid grid-cols-1 gap-3">
                            {paginatedExperts.map((expert) => (
                              <div
                                key={expert.id}
                                className={`p-3 border rounded-lg cursor-pointer transition duration-200 ${
                                  selectedExpert === expert.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                }`}
                                onClick={() => {
                                  setSelectedExpert(expert.id);
                                  setShowExpertList(false);
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name="expert"
                                    value={expert.id}
                                    checked={selectedExpert === expert.id}
                                    onChange={() => setSelectedExpert(expert.id)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 text-sm">{expert.name}</h4>
                                    <p className="text-xs text-gray-600 mb-1">{expert.expertise}</p>
                                    <p className="text-xs text-gray-500">{expert.email}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Expert Pagination */}
                          {expertTotalPages > 1 && (
                            <div className="bg-white flex justify-center items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => setExpertCurrentPage(Math.max(1, expertCurrentPage - 1))}
                                disabled={expertCurrentPage === 1}
                                className="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                              >
                                Prev
                              </button>
                              
                              <span className="bg-white text-sm text-gray-600">
                                Page {expertCurrentPage} of {expertTotalPages}
                              </span>
                              
                              <button
                                onClick={() => setExpertCurrentPage(Math.min(expertTotalPages, expertCurrentPage + 1))}
                                disabled={expertCurrentPage === expertTotalPages}
                                className="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="bg-white text-gray-500 text-center py-4">
                          No subject experts found matching your search.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Guide Selection */}
              <div>
                <div className="bg-white flex items-center gap-2 ">
                  <BookOpen className="bg-white text-gray-600" size={20} />
                  <h3 className="bg-white text-xl font-semibold text-gray-800">Select Guide</h3>
                  <span className="bg-white text-sm text-gray-500">({guides.length} available)</span>
                </div>
                
                {/* Selected Guide Display */}
                {selectedGuide && (
                  <div className="bg-white  p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="bg-white text-sm text-green-600 mb-1">Selected Guide:</p>
                    <p className="bg-white font-medium text-green-800">{selectedGuideName}</p>
                  </div>
                )}

                {/* Search Bar and Toggle */}
                <div className="bg-white space-y-3 ">
                  <div className="bg-white relative">
                    <Search className="bg-white absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by name, department, or email..."
                      value={guideSearchTerm}
                      onChange={(e) => setGuideSearchTerm(e.target.value)}
                      onFocus={() => setShowGuideList(true)}
                      className="bg-white w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowGuideList(!showGuideList)}
                    className="bg-white flex items-center gap-2 text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    {showGuideList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {showGuideList ? 'Hide' : 'Show'} Guide List 
                    {guideSearchTerm && `(${filteredGuides.length} found)`}
                  </button>
                </div>

                {/* Guides List */}
                {showGuideList && (
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="bg-white max-h-80 overflow-y-auto p-4">
                      {paginatedGuides.length > 0 ? (
                        <>
                          <div className="bg-white grid grid-cols-1 gap-3">
                            {paginatedGuides.map((guide) => (
                              <div
                                key={guide.id}
                                className={`p-3 border rounded-lg cursor-pointer transition duration-200 ${
                                  selectedGuide === guide.id
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                }`}
                                onClick={() => {
                                  setSelectedGuide(guide.id);
                                  setShowGuideList(false);
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name="guide"
                                    value={guide.id}
                                    checked={selectedGuide === guide.id}
                                    onChange={() => setSelectedGuide(guide.id)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 text-sm">{guide.name}</h4>
                                    <p className="text-xs text-gray-600 mb-1">{guide.department}</p>
                                    <p className="text-xs text-gray-500">{guide.email}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Guide Pagination */}
                          {guideTotalPages > 1 && (
                            <div className="bg-white flex justify-center items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => setGuideCurrentPage(Math.max(1, guideCurrentPage - 1))}
                                disabled={guideCurrentPage === 1}
                                className="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                              >
                                Prev
                              </button>
                              
                              <span className="bg-white text-sm text-gray-600">
                                Page {guideCurrentPage} of {guideTotalPages}
                              </span>
                              
                              <button
                                onClick={() => setGuideCurrentPage(Math.min(guideTotalPages, guideCurrentPage + 1))}
                                disabled={guideCurrentPage === guideTotalPages}
                                className="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="bg-white text-gray-500 text-center py-4">
                          No guides found matching your search.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="bg-white flex justify-center gap-4 pt-6">
                <button
                  onClick={handleBackToList}
                  disabled={submitting}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignReviewers}
                  disabled={submitting || !selectedExpert || !selectedGuide}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg transition duration-200"
                >
                  {submitting ? 'Assigning...' : 'Assign Reviewers'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl h-[90%]">
      <h2 className="text-3xl font-bold flex justify-center mb-8">
        Admin Dashboard
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow hover:scale-105 transition duration-200"
          >
            <p className="text-sm bg-white text-gray-500">{stat.title}</p>
            <h3 className="text-2xl bg-white font-semibold text-purple-500">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Challenge Reviews */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6 ">
        <div className="bg-white flex justify-between items-center mb-4">
          <h3 className="text-xl bg-white font-semibold">
            Challenge Reviews ({pendingReviews.length} pending)
          </h3>
          {loading && (
            <div className="bg-white text-sm text-gray-500">Loading...</div>
          )}
        </div>
        
        {currentReviews.length > 0 ? (
          <>
            <div className="bg-white space-y-3 mb-4">
              {currentReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gray-50 p-4 rounded-lg flex justify-between items-center"
                >
                  <div className="bg-gray-50">
                    <div className="bg-gray-50 font-medium text-gray-800">
                      Name: {review.student_name}
                    </div>
                    <div className="bg-gray-50 text-sm text-gray-600">
                      Reg No: {review.reg_no}
                    </div>
                    <div className="bg-gray-50 text-sm text-gray-600">
                      Project Name: {review.challenge_title}
                    </div>
                    <div className="bg-gray-50 text-xs text-gray-500">
                      Submitted: {new Date(review.submitted_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 flex gap-2">
                    <button
                      onClick={() => handleApproveReview(review)}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg flex items-center gap-1 transition duration-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectReview(review.id)}
                      disabled={loading}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg flex items-center gap-1 transition duration-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="bg-white px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded ${
                          currentPage === page
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 bg-white">No pending challenge reviews</p>
        )}
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6 hover:scale-105 transition duration-200">
        <h3 className="text-xl bg-white font-semibold mb-4">Upcoming Deadlines</h3>
        <ul className="list-disc bg-white pl-6 space-y-2 text-gray-700">
          {upcoming.length > 0 ? (
            upcoming.map((item, index) => (
              <li key={index} className="bg-white">
                <span className="font-medium bg-white">{item.name}</span> — {item.deadline}
              </li>
            ))
          ) : (
            <p className="text-gray-500 bg-white">No upcoming deadlines</p>
          )}
        </ul>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-2xl shadow hover:scale-105 transition duration-200">
        <h3 className="text-xl bg-white font-semibold mb-4">Recent Activity</h3>
        <ul className="list-disc bg-white pl-6 space-y-2 text-gray-700">
          {activity.map((act, index) => (
            <li key={index} className="bg-white">{act}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Admin_Dashboard;