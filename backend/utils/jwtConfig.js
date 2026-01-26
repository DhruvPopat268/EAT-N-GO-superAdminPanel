const getJwtConfig = (type) => {
  let secret, expiry;
  
  if (type === 'restaurant') {
    secret = process.env.JWT_SECRET_RESTAURENT;
    expiry = process.env.JWT_ACCESS_TOKEN_RESTAURANT_EXPIRY;
  } else if (type === 'superadmin') {
    secret = process.env.JWT_SECRET_SUPERADMIN;
    expiry = process.env.JWT_ACCESS_TOKEN_SUPER_ADMIN_EXPIRY;
  }
  
  if (!secret || !expiry) {
    throw new Error(`Missing JWT configuration for ${type}: secret=${!!secret}, expiry=${!!expiry}`);
  }
  
  return { secret, expiry };
};

module.exports = { getJwtConfig };