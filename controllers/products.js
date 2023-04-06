const Product = require('../models/product');

const getAllProductsStatic = async (req,res)=>
{
    const products = await Product.find({price:{$eq:30}})
    .sort('name')
    .select('name price')
    .limit(15);
    res.status(200).json({products, totalProduts:products.length});
}

const getAllProducts = async (req,res)=>
{
    const {featured,company,name,sort,fields, numericFilters}=req.query;
    const queryObject = {};
    let result = Product.find(queryObject);

    if(featured)
    {
        queryObject.featured = featured==='true'?true:false;
    }

    if(company)
    {
        queryObject.company = company
    }
    if(name)
    {
        queryObject.name = {$regex:name,$options:'i'};
    }

    if(numericFilters)
    {
        const operatorMap = 
        {
            '>':'$gt',
            '>=':'$gte',
            '=':'$eq',
            '<':'$lt',
            '<=':'$lte',
        }
        const regex = /\b(<|>|>=|=|<|<=)\b/g
        let filters = numericFilters.replace(regex, (match)=>`-${operatorMap[match]}-`)
        const options = ['price', 'rating'];
        filters = filters.split(',').forEach((item)=>
        {
            const [field,operator] = item.split('-');
            if(options.includes(field))
            {
                queryObject[field] = {[operator]:Number(value)}
            }
        })
    }

    // console.log(queryObject);
    if(sort)
    {
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    }
    else
    {
        result = result.sort('createdAt');
    }
    if(fields)
    {
        const fieldList = fields.split(',').join(' ');
        result = result.select(fieldList);
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page -1)*limit;
    result = result.skip(skip).limit(limit);

    const products = await result 
    res.status(200).json({products, totalProduts:products.length})
}

module.exports = {getAllProducts, getAllProductsStatic};