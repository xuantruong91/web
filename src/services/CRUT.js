const conncetion = require("../config/database");

const getAllUser = async () => {
    let [result, fields] = await connection.query('select * from person');
    return result;
}
module.exports = {
    getAllUser
   
}