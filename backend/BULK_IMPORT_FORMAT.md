# Bulk Import Excel Format

## Required Columns

| Column Name | Type | Required | Description | Example |
|-------------|------|----------|-------------|---------|
| name | String | Yes | Item name | "Chicken Biryani" |
| category | String | Yes | Veg/Non-Veg/Mixed | "Non-Veg" |
| subcategory | String | Yes | Subcategory name (must exist) | "Biryani" |
| description | String | No | Item description | "Delicious chicken biryani with basmati rice" |
| attributes | String | No | Format: "name:price;name:price" | "Small:150;Medium:200;Large:250" |
| foodTypes | String | No | Comma separated | "Regular,Jain" |
| customizations | String | No | Format: "name:option,qty,unit,price;option,qty,unit,price\|name:..." | "Breads:Tawa Roti,1,unit,15;Naan,1,unit,25" |
| currency | String | No | Currency code | "INR" |
| isAvailable | String | No | true/false | "true" |

## Format Examples

### Attributes Format
```
Small:150;Medium:200;Large:250
```

### Food Types Format
```
Regular,Jain,Swaminarayan
```

### Customizations Format
```
Breads:Tawa Roti,1,unit,15;Naan,1,unit,25|Sweets:Gulab Jamun,2,unit,30;Rasgulla,2,unit,25
```

## Notes
- Subcategory and Attribute names must already exist in the system
- All prices should be numeric values
- Boolean values should be "true" or "false"
- Use semicolon (;) to separate multiple items in the same field
- Use pipe (|) to separate different customization groups
- Use comma (,) to separate values within customization options