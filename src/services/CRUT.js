const conncetion = require("../config/database");

const getAllUser = async () => {
    let [result, fields] = await connection.query('select * from control_EC_pH');
    return result;
}
module.exports = {
    getAllUser
   
}