import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/${id}`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setRestaurant(result.data);
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Restaurant not found</div>
      </div>
    );
  }

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'verified': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✓';
      case 'verified': return '✓';
      case 'rejected': return '✗';
      case 'pending': return '⏳';
      default: return '📄';
    }
  };

  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    },
    header: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: '24px'
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    backButton: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      border: '2px solid #1976d2',
      color: '#1976d2',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    restaurantTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#1976d2',
      marginBottom: '8px'
    },
    rating: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#666'
    },
    statusChip: {
      padding: '8px 16px',
      borderRadius: '20px',
      color: 'white',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontSize: '14px'
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '24px',
      '@media (max-width: 1024px)': {
        gridTemplateColumns: '1fr'
      }
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: '24px',
      overflow: 'hidden'
    },
    cardContent: {
      padding: '32px'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1976d2',
      marginBottom: '8px'
    },
    divider: {
      height: '2px',
      backgroundColor: '#e0e0e0',
      border: 'none',
      margin: '16px 0 24px 0'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    },
    infoItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px 0'
    },
    infoIcon: {
      width: '24px',
      height: '24px',
      color: '#1976d2',
      marginTop: '2px'
    },
    infoLabel: {
      fontSize: '0.875rem',
      color: '#666',
      fontWeight: '500',
      marginBottom: '4px'
    },
    infoValue: {
      fontSize: '1rem',
      color: '#333',
      fontWeight: '400'
    },
    chipContainer: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginTop: '16px'
    },
    chip: {
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid #e0e0e0'
    },
    vegChip: {
      backgroundColor: '#4caf50',
      color: 'white',
      border: 'none'
    },
    outlinedChip: {
      backgroundColor: 'white',
      color: '#1976d2',
      border: '1px solid #1976d2'
    },
    featureChip: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
      border: '1px solid #bbdefb'
    },
    description: {
      backgroundColor: '#f8f9fa',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '1rem',
      lineHeight: '1.6',
      color: '#333',
      marginTop: '16px'
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    imageCard: {
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    restaurantImage: {
      width: '100%',
      height: '160px',
      objectFit: 'cover'
    },
    ownerCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      marginBottom: '16px'
    },
    avatar: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      backgroundColor: '#1976d2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px'
    },
    ownerName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#333',
      marginBottom: '4px'
    },
    ownerTitle: {
      fontSize: '0.875rem',
      color: '#666'
    },
    documentItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    documentIcon: {
      fontSize: '20px',
      width: '24px',
      textAlign: 'center'
    },
    documentName: {
      fontSize: '1rem',
      fontWeight: '500',
      color: '#333',
      marginBottom: '4px'
    },
    documentStatus: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      color: 'white'
    },
    documentDate: {
      fontSize: '0.75rem',
      color: '#666',
      marginTop: '2px'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      position: 'relative',
      maxWidth: '90%',
      maxHeight: '90%'
    },
    modalImage: {
      width: '600px',
      height: '400px',
      objectFit: 'cover',
      borderRadius: '8px'
    },
    closeButton: {
      position: 'absolute',
      top: '-40px',
      right: '0',
      background: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      cursor: 'pointer',
      fontSize: '18px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <button
              style={styles.backButton}
              onClick={() => window.history.back()}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1976d2';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#1976d2';
              }}
            >
              ← Back to List
            </button>
            <div style={{ marginTop: '24px' }}>
              <h1 style={styles.restaurantTitle}>{restaurant.restaurantName}</h1>
              <div style={styles.rating} className="mt-5">
                <span>★★★★★</span>
                <span>Application submitted {Math.floor((new Date() - new Date(restaurant.createdAt)) / (1000 * 60 * 60 * 24))} days ago</span>
              </div>
            </div>
          </div>
          <div style={{
            padding: '16px 24px',
            borderRadius: '12px',
            backgroundColor: restaurant.status === 'pending' ? '#fff3cd' : restaurant.status === 'approved' ? '#d4edda' : '#f8d7da',
            border: `2px solid ${restaurant.status === 'pending' ? '#ffc107' : restaurant.status === 'approved' ? '#28a745' : '#dc3545'}`,
            textAlign: 'center',
            minWidth: '150px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#666',
              fontWeight: '500',
              marginBottom: '4px'
            }}>Application Status</div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: restaurant.status === 'pending' ? '#856404' : restaurant.status === 'approved' ? '#155724' : '#721c24',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {restaurant.status === 'pending' && '⏳ '}
              {restaurant.status === 'approved' && '✅ '}
              {restaurant.status === 'rejected' && '❌ '}
              {restaurant.status}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* Main Information */}
        <div>
          {/* Basic Details Card */}
          <div style={styles.card}>
            <div style={styles.cardContent}>
              <h2 style={styles.cardTitle}>Restaurant Information</h2>
              <hr style={styles.divider} />

              <div style={styles.infoGrid}>
                <div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>🏪</div>
                    <div>
                      <div style={styles.infoLabel}>Restaurant Name</div>
                      <div style={styles.infoValue}>{restaurant.restaurantName}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>📍</div>
                    <div>
                      <div style={styles.infoLabel}>Address</div>
                      <div style={styles.infoValue}>{restaurant.address}, {restaurant.city}, {restaurant.state} - {restaurant.pincode}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>📞</div>
                    <div>
                      <div style={styles.infoLabel}>Phone</div>
                      <div style={styles.infoValue}>{restaurant.phone}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>🌍</div>
                    <div>
                      <div style={styles.infoLabel}>Country</div>
                      <div style={styles.infoValue}>{restaurant.country}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>💰</div>
                    <div>
                      <div style={styles.infoLabel}>Currency</div>
                      <div style={styles.infoValue}>{restaurant.country === 'India' ? 'INR (₹)' : restaurant.country === 'United States' ? 'USD ($)' : restaurant.country === 'United Kingdom' ? 'GBP (£)' : restaurant.country === 'Canada' ? 'CAD ($)' : restaurant.country === 'Australia' ? 'AUD ($)' : restaurant.country === 'Germany' ? 'EUR (€)' : restaurant.country === 'France' ? 'EUR (€)' : restaurant.country === 'Japan' ? 'JPY (¥)' : restaurant.country === 'Singapore' ? 'SGD ($)' : restaurant.country === 'UAE' ? 'AED (د.إ)' : 'USD ($)'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>✉️</div>
                    <div>
                      <div style={styles.infoLabel}>Email</div>
                      <div style={styles.infoValue}>{restaurant.email}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>📄</div>
                    <div>
                      <div style={styles.infoLabel}>License Number</div>
                      <div style={styles.infoValue}>{restaurant.licenseNumber}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>🏛️</div>
                    <div>
                      <div style={styles.infoLabel}>GST Number</div>
                      <div style={styles.infoValue}>{restaurant.gstNumber}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>🏦</div>
                    <div>
                      <div style={styles.infoLabel}>Bank Account</div>
                      <div style={styles.infoValue}>{restaurant.bankAccount}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>🔢</div>
                    <div>
                      <div style={styles.infoLabel}>IFSC Code</div>
                      <div style={styles.infoValue}>{restaurant.ifscCode}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>Food Categories</h3>
                <div style={styles.chipContainer}>
                  <span style={{ ...styles.chip, ...styles.vegChip }}>
                    {restaurant.foodCategory}
                  </span>
                  {restaurant.cuisineTypes && restaurant.cuisineTypes.map((cuisine, index) => (
                    <span key={index} style={{ ...styles.chip, ...styles.outlinedChip }}>
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>



              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>Description</h3>
                <div style={styles.description}>
                  {restaurant.description || 'No description provided'}
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Images */}
          <div style={styles.card}>
            <div style={styles.cardContent}>
              <h2 style={styles.cardTitle}>Restaurant Gallery</h2>
              <hr style={styles.divider} />

              <div style={styles.imageGrid}>
                {restaurant.restaurantImages && restaurant.restaurantImages.map((image, index) => (
                  <div
                    key={index}
                    style={styles.imageCard}
                    onClick={() => handleImageClick(image)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    <img
                      src={image}
                      alt={`Restaurant view ${index + 1}`}
                      style={styles.restaurantImage}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Owner Information */}
          <div style={styles.card}>
            <div style={styles.cardContent}>
              <h2 style={styles.cardTitle}>Owner Details</h2>
              <hr style={styles.divider} />

              <div style={styles.ownerCard}>
                <div style={styles.avatar}>
                  👤
                </div>
                <div>
                  <div style={styles.ownerName}>{restaurant.ownerName}</div>
                  <div style={styles.ownerTitle}>Restaurant Owner</div>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>📱</div>
                <div>
                  <div style={styles.infoLabel}>Contact</div>
                  <div style={styles.infoValue}>{restaurant.phone}</div>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>📅</div>
                <div>
                  <div style={styles.infoLabel}>Established</div>
                  <div style={styles.infoValue}>{new Date(restaurant.createdAt).getFullYear()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Certification Status */}
          <div style={styles.card}>
            <div style={styles.cardContent}>
              <h2 style={styles.cardTitle}>Certification Status</h2>
              <hr style={styles.divider} />

              <div style={{
                backgroundColor: '#e3f2fd',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={styles.infoLabel}>License Number</div>
                <div style={{ ...styles.infoValue, fontWeight: '600' }}>{restaurant.licenseNumber}</div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>📋</div>
                <div>
                  <div style={styles.infoLabel}>Application Date</div>
                  <div style={styles.infoValue}>{new Date(restaurant.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Status */}
          <div style={styles.card}>
            <div style={styles.cardContent}>
              <h2 style={styles.cardTitle}>Documents & Verification</h2>
              <hr style={styles.divider} />

              <div>
                {restaurant.documents && Object.entries(restaurant.documents).map(([key, url]) => {
                  if (!url) return null;

                  const urlString = url ? String(url) : '';
                  const isImage = urlString.toLowerCase().includes('.jpg') || urlString.toLowerCase().includes('.jpeg') || urlString.toLowerCase().includes('.png') || urlString.toLowerCase().includes('.gif');
                  const isPdf = urlString.toLowerCase().includes('.pdf');

                  const handleDocumentClick = async () => {
                    if (isImage) {
                      handleImageClick(url);
                    } else if (isPdf) {
                      try {
                        // Fetch the PDF file
                        const response = await fetch(url);
                        const blob = await response.blob();

                        // Create a blob URL and download
                        const blobUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `${key.replace(/([A-Z])/g, '_$1').toLowerCase()}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        // Clean up the blob URL
                        window.URL.revokeObjectURL(blobUrl);
                      } catch (error) {
                        console.error('Download failed:', error);
                        // Fallback: open in new tab
                        window.open(url, '_blank');
                      }
                    } else {
                      window.open(url, '_blank');
                    }
                  };

                  return (
                    <div key={key} style={styles.documentItem}>
                      <div style={styles.documentIcon}>
                        {isImage ? '🖼️' : isPdf ? '📄' : '📎'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.documentName}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                        <div style={{
                          ...styles.documentStatus,
                          backgroundColor: getStatusColor('verified')
                        }}>
                          UPLOADED
                        </div>
                        <button
                          onClick={handleDocumentClick}
                          style={{
                            fontSize: '0.75rem',
                            color: '#1976d2',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                            marginTop: '4px'
                          }}
                        >
                          {isImage ? 'View Image' : isPdf ? 'View PDF' : 'View Document'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div style={styles.modal} onClick={() => setShowImageModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.closeButton}
              onClick={() => setShowImageModal(false)}
            >
              ×
            </button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Restaurant"
                style={styles.modalImage}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}