import React, { useState } from "react";

// Mock data with real restaurant images
const restaurantData = {
  1: {
    id: 1,
    name: "Food Fiesta",
    location: "Ahmedabad, Gujarat",
    address: "123 Food Street, Satellite, Ahmedabad - 380015",
    phone: "+91 9876543210",
    email: "foodfiesta@email.com",
    country: "India",
    currency: "INR (₹)",
    foodCategory: "Veg",
    rating: 4.5,
    totalReviews: 238,
    description: "A premium vegetarian restaurant serving authentic Gujarati and North Indian cuisine with traditional flavors and modern presentation. Our chefs use only the finest ingredients to create memorable dining experiences.",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&h=300&fit=crop&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&ixlib=rb-4.0.3"
    ],
    certification: "FSSAI License: 12345678901234",
    documents: [
      { name: "FSSAI License", status: "verified", uploadDate: "2023-01-15" },
      { name: "Trade License", status: "verified", uploadDate: "2023-01-20" },
      { name: "Fire Safety Certificate", status: "pending", uploadDate: "2023-12-01" },
      { name: "GST Registration", status: "verified", uploadDate: "2023-01-18" },
      { name: "Health Permit", status: "verified", uploadDate: "2023-02-01" }
    ],
    ownerName: "Rajesh Patel",
    ownerPhone: "+91 9123456789",
    establishedYear: "2018",
    capacity: "50 seats",
    cuisineTypes: ["Gujarati", "North Indian", "Street Food", "Thali"],
    features: ["Air Conditioned", "Family Seating", "Parking Available", "Home Delivery"],
    operatingHours: "10:00 AM - 10:00 PM",
    status: "pending",
    applicationDate: "2024-01-15"
  }
};

export default function RestaurantDetail() {
  const restaurant = restaurantData[1];
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

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
      width: '100%',
      height: 'auto',
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
            <h1 style={styles.restaurantTitle}>{restaurant.name}</h1>
            <div style={styles.rating}>
              <span>★★★★★</span>
              <span>{restaurant.rating} ({restaurant.totalReviews} reviews)</span>
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
                      <div style={styles.infoValue}>{restaurant.name}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>📍</div>
                    <div>
                      <div style={styles.infoLabel}>Address</div>
                      <div style={styles.infoValue}>{restaurant.address}</div>
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
                    <div style={styles.infoIcon}>🕐</div>
                    <div>
                      <div style={styles.infoLabel}>Operating Hours</div>
                      <div style={styles.infoValue}>{restaurant.operatingHours}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>👥</div>
                    <div>
                      <div style={styles.infoLabel}>Capacity</div>
                      <div style={styles.infoValue}>{restaurant.capacity}</div>
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>💰</div>
                    <div>
                      <div style={styles.infoLabel}>Currency</div>
                      <div style={styles.infoValue}>{restaurant.currency}</div>
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
                  {restaurant.cuisineTypes.map((cuisine, index) => (
                    <span key={index} style={{ ...styles.chip, ...styles.outlinedChip }}>
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>Features & Amenities</h3>
                <div style={styles.chipContainer}>
                  {restaurant.features.map((feature, index) => (
                    <span key={index} style={{ ...styles.chip, ...styles.featureChip }}>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>Description</h3>
                <div style={styles.description}>
                  {restaurant.description}
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
                {restaurant.images.map((image, index) => (
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
                  <div style={styles.infoValue}>{restaurant.ownerPhone}</div>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>📅</div>
                <div>
                  <div style={styles.infoLabel}>Established</div>
                  <div style={styles.infoValue}>{restaurant.establishedYear}</div>
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
                <div style={styles.infoLabel}>FSSAI License</div>
                <div style={{ ...styles.infoValue, fontWeight: '600' }}>{restaurant.certification}</div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>📋</div>
                <div>
                  <div style={styles.infoLabel}>Application Date</div>
                  <div style={styles.infoValue}>{restaurant.applicationDate}</div>
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
                {restaurant.documents.map((doc, index) => (
                  <div key={index} style={styles.documentItem}>
                    <div style={styles.documentIcon}>
                      {getStatusIcon(doc.status)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.documentName}>{doc.name}</div>
                      <div style={{
                        ...styles.documentStatus,
                        backgroundColor: getStatusColor(doc.status)
                      }}>
                        {doc.status.toUpperCase()}
                      </div>
                      <div style={styles.documentDate}>
                        Uploaded: {doc.uploadDate}
                      </div>
                    </div>
                  </div>
                ))}
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