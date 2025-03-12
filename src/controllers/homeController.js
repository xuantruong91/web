const connection = require('../config/database');


const getHomepage = async (req, res) => {

    return res.render('home.ejs')
}



const postCreateUsers = async (req, res) => {
    //console.log(">>req.body = ", req.body) //req.body dùng lấy data kiểu name khai báo trong input
    let username = req.body.username;  // req.body.'tên key' đặt với name bên html
    let Email = req.body.Email;
    let password = req.body.password;

    //let { Name, Email, City } = req.body
    let [result, fields] = await connection.query(
        `insert into users (username,email,password) values (?,?,?)`, [username, Email, password], //truyen động dữ liệu

    );
    //res.send('Save thành công')
    res.redirect('/list')
}
const create_user = (req, res) => {
    res.render('create_user.ejs')
}
const list_users = async (req, res) => {
    let [result, fields] = await connection.query('select * from users');
    return res.render('list-user.ejs', { listuser: result })
}
const EditUsers = async (req, res) => {
    const userID = req.params.id;

    //console.log(userID);
    let [result, fields] = await connection.query('select * from users where id=?', [userID])
    console.log(result)
    let user = result && result.length > 0 ? result[0] : {};
    res.render('edit.ejs', { userEdit: user })

}
const UpdateUsers = async (req, res) => {
    //console.log(">>req.body = ", req.body) //req.body dùng lấy data kiểu name khai báo trong input
    let username = req.body.username;  // req.body.'tên key' đặt với name bên html
    let Email = req.body.Email;
    let password = req.body.password;
    let id = req.body.ID;
    //let { Name, Email, City } = req.body
    let [result, fields] = await connection.query(
        `UPDATE users
            SET username = ?, email =?, password= ?
            WHERE id = ?`,
        [username, Email, password, id], //truyen động dữ liệu
    );
    //res.send('Update thành công')
    res.redirect('/list')
}
const Delete = async (req, res) => {
    const userID = req.params.id;
    let [result, fields] = await connection.query('select * from users where id=?', [userID])
    let user = result && result.length > 0 ? result[0] : {};
    res.render('delete.ejs', { userEdit: user })

}
const PostDelete = async (req, res) => {
    const id = req.body.ID
    let [result, fields] = await connection.query(
        'Delete from users where id=?', [id])
    res.redirect('/list')
}

const PostLogin = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
        let [results, fields] = await connection.query(
            `SELECT * FROM users WHERE username = ? AND password = ?`, [username, password]
        );

        if (results.length > 0) {
            // Lưu thông tin user vào session
            //req.session.user = results[0];
            res.redirect('/homelogin');
        } else {
            res.send('Sai tên đăng nhập hoặc mật khẩu');
        }
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).send('Lỗi server');
    }
};


const PLC_data = async (req, res) => {
    let [result, fields] = await connection.query('select * from test');
    return res.render('data.ejs', { data: result })
}
const PLC_HMI = async (req, res) => {
    res.render('hmi.ejs')
}

module.exports = {
    getHomepage, EditUsers, Delete, PLC_data, PLC_HMI,
    PostLogin, create_user, postCreateUsers,
    PostDelete, list_users, UpdateUsers
}