# File Upload Logic - Update Step Route

## Overview
Documentation for image and document upload handling in `/update-step` route.

## File Storage Structure
```
backend/cloud/
├── images/      - Compressed WebP images
└── documents/   - PDF documents
```

## Upload Flow

### 1. Directory Cache (One-time per server restart)
```javascript
const createdDirs = new Set();

const uploadToServerFast = async (fileBuffer, filename, isImage = true) => {
  const folder = isImage ? "images" : "documents";
  const uploadPath = path.join(__dirname, `../cloud/${folder}`);

  // Create directory only once
  if (!createdDirs.has(uploadPath)) {
    await fs.mkdir(uploadPath, { recursive: true });
    createdDirs.add(uploadPath);
  }
  
  const filePath = path.join(uploadPath, filename);
  // ... process file
};
```

### 2. File Processing

#### Images (JPEG, PNG → WebP)
```javascript
if (isImage) {
  await sharp(fileBuffer)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({
      quality: 70,
      effort: 1,
      smartSubsample: true
    })
    .toFile(filePath);
}
```

#### Documents (PDF)
```javascript
else {
  await fs.writeFile(filePath, fileBuffer);
}
```

### 3. Parallel Upload (All files at once)
```javascript
const processAllFiles = async (files) => {
  return Promise.all(
    files.map(async (file) => {
      const isImage = file.mimetype.startsWith("image/");
      const ext = path.extname(file.originalname) || (isImage ? ".webp" : ".pdf");
      const filename = `${file.fieldname}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}${ext}`;

      const url = await uploadToServerFast(file.buffer, filename, isImage);
      return { fieldname: file.fieldname, url, success: true };
    })
  );
};
```

### 4. File Organization

#### Array Fields (Multiple files)
```javascript
const arrayFields = ["aadhar", "drivingLicense", "vehiclePhotos"];
const fileGroups = {};

uploadResults.forEach((result) => {
  if (result.success && arrayFields.includes(result.fieldname)) {
    if (!fileGroups[result.fieldname]) fileGroups[result.fieldname] = [];
    fileGroups[result.fieldname].push(result.url);
  }
});
```

#### Single File Fields
```javascript
const singleFiles = {};

uploadResults.forEach((result) => {
  if (result.success && !arrayFields.includes(result.fieldname)) {
    singleFiles[result.fieldname] = result.url;
  }
});
```

### 5. Merge with Existing Files
```javascript
Object.entries(fileGroups).forEach(([fieldName, urls]) => {
  if (urls.length > 0) {
    const existingUrls = driverData[field]?.[fieldName] || [];
    data[fieldName] = [...new Set([...existingUrls, ...urls])];
  }
});
```

## Complete Upload Process

```javascript
router.post("/update-step", DriverAuthMiddleware, upload.any(), async (req, res) => {
  // 1. Parallel: Fetch driver data + Upload all files
  const [driverData, uploadResults] = await Promise.all([
    Driver.findOne({ mobile }).select(selectFields).lean(),
    req.files?.length ? processAllFiles(req.files) : Promise.resolve([])
  ]);

  // 2. Organize uploaded files
  const fileGroups = {};
  const singleFiles = {};
  const arrayFields = ["aadhar", "drivingLicense", "vehiclePhotos"];

  uploadResults.forEach((result) => {
    if (result.success) {
      if (arrayFields.includes(result.fieldname)) {
        if (!fileGroups[result.fieldname]) fileGroups[result.fieldname] = [];
        fileGroups[result.fieldname].push(result.url);
      } else {
        singleFiles[result.fieldname] = result.url;
      }
    }
  });

  // 3. Add single files to data
  Object.assign(data, singleFiles);

  // 4. Merge array fields with existing
  Object.entries(fileGroups).forEach(([fieldName, urls]) => {
    if (urls.length > 0) {
      const existingUrls = driverData[field]?.[fieldName] || [];
      data[fieldName] = [...new Set([...existingUrls, ...urls])];
    }
  });

  // 5. Update database
  const updates = { [field]: { ...driverData[field], ...data } };
  await Driver.findOneAndUpdate({ mobile }, { $set: updates });
});
```

## File URL Format
```
https://adminbackend.hire4drive.com/app/cloud/{folder}/{filename}

Example:
https://adminbackend.hire4drive.com/app/cloud/images/passportPhoto_1234567890_abc123xyz.webp
https://adminbackend.hire4drive.com/app/cloud/documents/rc_1234567890_def456uvw.pdf
```

## Optimizations

1. **Cached Directories**: Created once per server restart
2. **Parallel Processing**: All files upload simultaneously
3. **Direct File Write**: No intermediate buffers
4. **Image Compression**: WebP format, 800px width, 70% quality
5. **Unique Filenames**: `fieldname_timestamp_random.ext`