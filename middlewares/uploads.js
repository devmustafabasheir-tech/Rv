import multer from 'multer';
import path from 'path';

 const storage = multer.diskStorage({
    destination: function(req, file, cb) {
         cb(null, path.join(__dirname, '../views/user_uploads'));
    },
    filename: function(req, file, cb) {
         const uniqueSuffix = new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});



 const fileFilter = function(req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;  
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'));  
    }
};

 const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, 
    fileFilter: fileFilter
});

export default upload;