import multer from 'multer';
import path from 'path';

// إعداد تخزين الملفات باستخدام multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // تخزين الملفات داخل مجلد 'user_uploads'
        cb(null, path.join(__dirname, '../views/user_uploads'));
    },
    filename: function(req, file, cb) {
        // إضافة توقيت فريد لاسم الملف للحفاظ على اسمه الأصلي وتجنب التكرار
        const uniqueSuffix = new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});



// تحديد أنواع الملفات المقبولة
const fileFilter = function(req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/; // السماح فقط بملفات الصور
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed!')); // إذا كان نوع الملف غير مدعوم
    }
};

// إعداد multer مع تحديد حجم الملف وأنواع الملفات
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5 ميغابايت كحد أقصى
    fileFilter: fileFilter
});

export default upload;