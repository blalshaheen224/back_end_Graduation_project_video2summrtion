const cloudinary = require('./cloudinary');

async function testCloudinary() {
  try {
    // هنسحب أول 1 resource عشان نتأكد من الاتصال
    const result = await cloudinary.api.resources({ max_results: 1 });
    console.log('✅ Cloudinary connection OK');
    console.log(result);
  } catch (err) {
    console.error('❌ Cloudinary connection failed');
    console.error(err);
  }
}

testCloudinary();
