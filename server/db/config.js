// 数据库配置文件
var mongoose = require('mongoose');
// 改成你的mongodb 数据库
mongoose.connect('mongodb://localhost:27017/login');
module.exports = mongoose;
