# Changes Needed for BasePrice Field

## AddMenuItem.jsx Changes:

1. Update currentAttribute state (line ~69):
```javascript
const [currentAttribute, setCurrentAttribute] = useState({
  basePrice: '',
  value: '',
  unit: null
});
```

2. Update mapped attributes in edit mode (line ~117):
```javascript
const mappedAttributes = itemData.attributes?.map((attr, index) => {
  const attributeOption = attributes.find(a => a.name === attr.name);
  return {
    id: Date.now() + index,
    basePrice: attr.basePrice?.toString() || '',
    value: attr.price?.toString() || '',
    unit: attributeOption ? { id: attributeOption._id, name: attributeOption.name } : null
  };
}).filter(attr => attr.unit) || [];
```

3. Update attributes mapping when submitting (line ~456 and ~577):
```javascript
attributes: formData.attributes.map(attr => ({
  attribute: attr.unit.id,
  basePrice: parseFloat(attr.basePrice || 0),
  price: parseFloat(attr.value)
})),
```

4. Update addAttribute function (line ~738):
```javascript
setCurrentAttribute({ basePrice: '', value: '', unit: null });
```

5. Update editAttribute function (line ~750):
```javascript
const editAttribute = (attr) => {
  setCurrentAttribute({
    basePrice: attr.basePrice,
    value: attr.value,
    unit: attr.unit
  });
  removeAttribute(attr.id);
};
```

6. Update UI to show two input fields (around line ~1050):
Replace the single "Attribute Value" input with:
```jsx
<div className="mb-4">
  <CustomDropdown
    label="Attribute"
    value={currentAttribute.unit}
    options={attributes.filter(attr => !formData.attributes.some(selected => selected.unit.id === attr._id)).map(attr => ({ id: attr._id, name: attr.name }))}
    onChange={(option) => setCurrentAttribute(prev => ({ ...prev, unit: option }))}
    placeholder={attributes.length === 0 ? "No attributes available" : "Select attribute"}
    isOpen={showUnitDropdown}
    setIsOpen={setShowUnitDropdown}
  />
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Base Price</label>
      <input
        type="number"
        placeholder="Base Price"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-400 transition-colors"
        value={currentAttribute.basePrice}
        onChange={(e) => setCurrentAttribute(prev => ({ ...prev, basePrice: e.target.value }))}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
      <input
        type="number"
        placeholder="Price"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-400 transition-colors"
        value={currentAttribute.value}
        onChange={(e) => setCurrentAttribute(prev => ({ ...prev, value: e.target.value }))}
      />
    </div>
  </div>
</div>
```

7. Update attribute display (around line ~1080):
```jsx
{formData.attributes.map((attr) => (
  <div key={attr.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
    <span className="text-sm text-gray-700">{attr.unit.name}</span>
    <div className="flex flex-col items-end">
      <span className="text-xs text-gray-500">Base: {attr.basePrice} {formData.currency.symbol}</span>
      <span className="font-semibold">{attr.value} {formData.currency.symbol}</span>
    </div>
    <div className="flex gap-2">
      <button type="button" onClick={() => editAttribute(attr)} className="text-blue-500 hover:text-blue-700 p-1 cursor-pointer">
        <Edit size={16} />
      </button>
      <button type="button" onClick={() => handleDeleteConfirmation('attribute', attr.id)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer">
        <Trash2 size={16} />
      </button>
    </div>
  </div>
))}
```

## MenuList.jsx Changes:

No changes needed - MenuList.jsx already displays attributes correctly with the price field.
