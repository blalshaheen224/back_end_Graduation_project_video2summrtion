// 1️⃣ Base Query
// 2️⃣ Filtering
// 3️⃣ Search
// 4️⃣ Sorting
// 5️⃣ Field Limiting
// 6️⃣ Pagination
// 7️⃣ Execute Query
// 8️⃣ Count Total
// 9️⃣ Return Response


class ApiFeature {
    constructor(queryMoongs, queryString){
        this.query = queryMoongs;
        this.queryString = queryString; // object من req.query
    }

    filter(){
        const allowFields = ['price', 'category', 'subcategories', 'brand', 'ratingsAverage', 'ratingsQuantity'];
        const queryObj = { ...this.queryString };

        Object.keys(queryObj).forEach(key => {
            if(!allowFields.includes(key)) delete queryObj[key];
        });

        const allowOP = ['gt','gte','lt','lte']; // 
        Object.keys(queryObj).forEach(key => {
            if(typeof queryObj[key] === 'object'){
                Object.keys(queryObj[key]).forEach(op => {
                    if(!allowOP.includes(op)) delete queryObj[key][op];
                });
            }
        });

        let stringQuery = JSON.stringify(queryObj);
        stringQuery = stringQuery.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
        this.query = this.query.find(JSON.parse(stringQuery));
        return this;
    }

    Search(){
        if(this.queryString.keyword){
            this.query = this.query.find({
                $text: { $search: this.queryString.keyword }
            });
        }
        return this;
    }
    sort() {
  if (this.queryString.sort) {
    const sortFields = this.queryString.sort.split(',').map(f => f.trim());

    const allowedSortFields = ['price', 'ratingsAverage', 'name', 'category'];
    const safeSortFields = sortFields.filter(field =>
      allowedSortFields.includes(field.replace('-', ''))
    );

    if (safeSortFields.length > 0) {
      this.query = this.query.sort(safeSortFields.join(' '));
    }
  } else {
    this.query = this.query.sort('-createdAt');
  }
  return this; 
}
 limitFields() {
  if (this.queryString.fields) {

    const requestedFields = this.queryString.fields
      .split(',')
      .map(field => field.trim());

    const allowedFields = [
      'name',
      'price',
      'ratingsAverage',
      'category',
      'description',
      'createdAt',
      'subcategories',
      'brand',
      'ratingsQuantity',
      'priceAfterDiscount'
    ];

    const safeFields = requestedFields.filter(field =>
      allowedFields.includes(field)
    );

    if (safeFields.length > 0) {
      this.query = this.query.select(safeFields.join(' '));
    } else {
      this.query = this.query.select('-__v');
    }

  } else {
   this.query = this.query.select('-__v');
  }

  return this;
}
 
paginate(documentsCount) {
  const page = Math.max(parseInt(this.queryString.page) || 1, 1);
  const limit = Math.max(parseInt(this.queryString.limit) || 10, 1);

  const skip = (page - 1) * limit;
// 10  3    3   1-3 2-3 3-3 
  this.query = this.query.skip(skip).limit(limit);
 
  const pagination = {};
  const totalPages = Math.max(Math.ceil(documentsCount / limit),1) ;

  pagination.page = page>totalPages ? totalPages :page ;
  pagination.limit = limit;
  pagination.totalPages = totalPages;


  if (page < totalPages){
     pagination.next = page + 1;
  }
  else pagination.next = null;

  if (page > 1){
     pagination.prev = page - 1;
  }
  else pagination.prev = null

  this.paginationResult = pagination;

  return this;
}

}


module.exports = ApiFeature