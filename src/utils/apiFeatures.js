class API_FEATURE {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "limit", "sort", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1. Advanced Filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  fieldLimiting() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      // excluding  __v of mongoose   from sending to client
      this.query = this.query.select("-__v");
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1; // current page
    // limit the number of item displayd per page
    const limit = this.queryString.limit * 1 || 100;
    //  skip the first n- documents.
    const skip = (page - 1) * limit;
    // check if page is exist
    // if (this.queryString.page) {
    //   const tourNUmber = await Tour.countDocuments();
    //   if (skip > tourNUmber) {
    //     throw new Error("page isn't  found");
    //   }
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
// Build Query

// const queryObj = { ...req.query };
// const excludedFields = ["page", "limit", "sort", "fields"];
// excludedFields.forEach((el) => delete queryObj[el]);

// // 1. Advanced Filtering
// let queryString = JSON.stringify(queryObj);
// queryString = queryString.replace(
//   /\b(gte|gt|lte|lt)\b/g,
//   (match) => `$${match}`
// );

// let query = Tour.find(JSON.parse(queryString));
// SORTING
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(",").join(" ");
//   query = query.sort(sortBy);
// } else {
//   query = query.sort("-createdAt");
// }
// // FIELD LIMITING.
// if (req.query.fields) {
//   const fields = req.query.fields.split(",").join(" ");
//   query = query.select(fields);
// } else {
//   // excluding  __v of mongoose   from sending to client
//   query = query.select("-__v");
// }

// // PAGINATON.

// const page = req.query.page * 1 || 1; // current page
// // limit the number of item displayd per page
// const limit = req.query.limit * 1 || 100;
// //  skip the first n- documents.
// const skip = (page - 1) * limit;
// // check if page is exist
// if (req.query.page) {
//   const tourNUmber = await Tour.countDocuments();
//   if (skip > tourNUmber) {
//     throw new Error("page isn't  found");
//   }
// }
// query = query.skip(skip).limit(limit);
module.exports = API_FEATURE;
