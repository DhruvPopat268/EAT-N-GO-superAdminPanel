const orderPopulateConfig = [
  { path: 'userId', select: 'fullName phone' },
  { path: 'restaurantId', select: 'basicInfo.restaurantName' },
  {
    path: 'items.itemId',
    model: 'Item',
    select: 'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
    populate: [
      { path: 'subcategory', model: 'Subcategory', select: 'name' },
      { path: 'addons', model: 'AddonItem', select: 'category name description images currency isAvailable attributes' }
    ]
  },
  { path: 'items.selectedAttribute', model: 'Attribute', select: 'name' },
  {
    path: 'items.selectedAddons.addonId',
    model: 'AddonItem',
    select: 'category name description images currency isAvailable attributes',
    populate: { path: 'attributes.attribute', model: 'Attribute' }
  },
  { path: 'items.selectedAddons.selectedAttribute', model: 'Attribute', select: 'name' },
  { path: 'userRatingId' }
];

const orderRequestPopulateConfig = [
  { path: 'userId', select: 'fullName phone' },
  { path: 'restaurantId', select: 'basicInfo.restaurantName' },
  {
    path: 'items.itemId',
    model: 'Item',
    select: 'category name description images foodTypes currency isAvailable isPopular subcategory attributes customizations addons',
    populate: [
      { path: 'subcategory', model: 'Subcategory', select: 'name' },
      { path: 'addons', model: 'AddonItem', select: 'category name description images currency isAvailable attributes' }
    ]
  },
  { path: 'items.selectedAttribute', model: 'Attribute', select: 'name' },
  {
    path: 'items.selectedAddons.addonId',
    model: 'AddonItem',
    select: 'category name description images currency isAvailable attributes',
    populate: { path: 'attributes.attribute', model: 'Attribute' }
  },
  { path: 'items.selectedAddons.selectedAttribute', model: 'Attribute', select: 'name' }
];

const buildOrderQuery = (Model, filter, { page, limit }) => {
  const skip = (page - 1) * limit;
  const populateConfig = Model.modelName === 'OrderRequest' ? orderRequestPopulateConfig : orderPopulateConfig;
  return Model.find(filter)
    .populate(populateConfig)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = { orderPopulateConfig, orderRequestPopulateConfig, buildOrderQuery };