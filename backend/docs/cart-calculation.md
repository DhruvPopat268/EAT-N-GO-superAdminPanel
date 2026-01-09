# Cart Total Calculation Documentation

## Overview
This document explains how cart totals are calculated for different item configurations in the EAT-N-GO system.

## Calculation Components

### Base Components
- **itemPrice**: Price from selected attribute
- **customizationTotal**: Sum of all customization option prices × quantities
- **addonsTotal**: Sum of all addon prices × quantities
- **itemTotal**: (itemPrice + customizationTotal) × item quantity
- **cartTotal**: Sum of all itemTotals + all addonsTotals

## Calculation Cases

### 1. Only Item (No addons/customizations)
```
itemPrice = selectedAttribute.price
customizationTotal = 0
addonsTotal = 0
itemTotal = itemPrice × quantity
cartTotal += itemTotal
```

**Example:**
- Item price: ₹100, Quantity: 2
- itemTotal = ₹100 × 2 = ₹200
- cartTotal = ₹200

### 2. Item with Addon
```
itemPrice = selectedAttribute.price
customizationTotal = 0
addonsTotal = sum of (addonAttribute.price × addon.quantity)
itemTotal = itemPrice × quantity
cartTotal += itemTotal + addonsTotal
```

**Example:**
- Item price: ₹100, Quantity: 2
- Addon price: ₹20, Addon quantity: 2
- itemTotal = ₹100 × 2 = ₹200
- addonsTotal = ₹20 × 2 = ₹40
- cartTotal = ₹200 + ₹40 = ₹240

### 3. Item with Customization
```
itemPrice = selectedAttribute.price
customizationTotal = sum of (option.price × option.quantity)
addonsTotal = 0
itemTotal = (itemPrice + customizationTotal) × quantity
cartTotal += itemTotal
```

**Example:**
- Item price: ₹100, Quantity: 2
- Customization option price: ₹15, Option quantity: 1
- customizationTotal = ₹15 × 1 = ₹15
- itemTotal = (₹100 + ₹15) × 2 = ₹230
- cartTotal = ₹230

### 4. Item with Addon and Customization
```
itemPrice = selectedAttribute.price
customizationTotal = sum of (option.price × option.quantity)
addonsTotal = sum of (addonAttribute.price × addon.quantity)
itemTotal = (itemPrice + customizationTotal) × quantity
cartTotal += itemTotal + addonsTotal
```

**Example:**
- Item price: ₹100, Quantity: 2
- Customization option: ₹15 × 1 = ₹15
- Addon: ₹20 × 2 = ₹40
- customizationTotal = ₹15
- itemTotal = (₹100 + ₹15) × 2 = ₹230
- addonsTotal = ₹40
- cartTotal = ₹230 + ₹40 = ₹270

## Key Rules

1. **Customizations** are multiplied by item quantity (included in itemTotal)
2. **Addons** are calculated separately and added to cartTotal
3. **Item price** comes from the selected attribute price
4. **Cart total** is sum of all itemTotals + all addonsTotals
5. **Multiple customization options** in same group are summed together
6. **Multiple addons** are calculated individually and summed