const bcrypt = require("bcrypt");
require("dotenv").config();

var express = require("express");
let app = express();
let mysql2 = require("mysql2");


var fileuploader = require("express-fileupload");
app.use(fileuploader());


app.listen(process.env.PORT, function () {
    console.log("Server started on port", process.env.PORT);
})
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

let config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    dateStrings: true
}

var mysql = mysql2.createConnection(config);
mysql.connect(function (err) {
    if (err == null) {
        console.log("connected to database successfully");
    }
    else
        console.log(err.message);
})

app.get("/", function (req, resp) {
    let path = __dirname + "/public/index.html";
    resp.sendFile(path);
})

app.get("/signup-process", function (req, resp) {
    console.log(req.query);

    let email = req.query.txtEmail;
    let pwd = req.query.pwd;
    let utype = req.query.combo;

    
    const emailPattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    var passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;


    if (!emailPattern.test(email)) {
        return resp.send("Please enter a valid email address.");
    }

    if (!passwordPattern.test(pwd)) {
        return resp.send("Please enter a strong password.");
    }


    bcrypt.hash(pwd, 10, function (err, hash) {
    if (err) {
        return resp.send("Error hashing password");
    }

    mysql.query(
        "insert into users (email, pwd, utype, status) values (?, ?, ?, 1)",
        [email, hash, utype],
        function (err) {
            if (err) return resp.send(err.message);
            resp.send("Signed up successfully..!");
        }
    );
});
});


app.get("/login-process", function (req, resp) {

    let emaill = req.query.txtEmaill;
    let txtPwd = req.query.txtPwd;

    mysql.query(
        "select * from users where email=?",
        [emaill],
        function (err, result) {

            if (err) {
                resp.send(err.message);
                return;
            }

            if (result.length === 0) {
                resp.send("Invalid Id or Password");
                return;
            }

            bcrypt.compare(txtPwd, result[0].pwd, function (err, isMatch) {

                if (!isMatch) {
                    resp.send("Invalid Id or Password");
                    return;
                }

                if (result[0].status == 1) {
                    resp.send(result[0].utype);
                } else {
                    resp.send("You are Blocked......!!!");
                }
            });
        }
    );
});
app.get("/infl-dash", function (req, resp) {
    let path = __dirname + "/public/infl-dash.html";

    resp.sendFile(path);
})

app.get("/infl-profile", function (req, resp) {
    let path = __dirname + "/public/infl-profile.html";

    resp.sendFile(path);
})

app.post("/profile-process", function (req, resp) {
    let fileName = "";
    if (req.files != null) {
        fileName = req.files.ppic.name;
        let path = __dirname + "/public/uploads/" + fileName;
        req.files.ppic.mv(path);
        //req.body.ppic=fileName;
        //resp.send(req.body);
    }
    else
        fileName = "nopic.jpg";


    console.log(req.body);

    mysql.query("insert into profilei values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [req.body.inputeml, fileName, req.body.first, req.body.last, req.body.cnt, req.body.inputGender, req.body.inputDob, req.body.inputAddress, req.body.inputCity, req.body.inputState, req.body.inputZip, req.body.inputFields.toString(), req.body.inputInsta, req.body.inputFb, req.body.inputYt, req.body.inputInfo], function (err) {
        if (err == null) {
            resp.redirect("result.html");
        }
        else
            resp.send(err.message);
    })
})


//AJAX CALL RESPONSE
//=================================================================================================================

app.get("/find-user-details", function (req, resp) {
    let eml = req.query.inputeml;
    mysql.query("select * from profilei where eml=?", [eml], function (err, resultJsonAry) {
        if (err != null) {
            resp.send("Invalid id");
            return;
        }
        console.log(resultJsonAry);
        resp.send(resultJsonAry); // sending array of Json object 0-1
    })
})


app.post("/profile-update", function (req, resp) {
    console.log(req.body);
    let fileName = "";
    if (req.files != null) {
        fileName = req.files.ppic.name;
        let path = __dirname + "/public/uploads/" + fileName;
        req.files.ppic.mv(path);
        //req.body.ppic=fileName;
        //resp.send(req.body);
    }
    else {
        fileName = req.body.hdn;
    }

    //--------------------please use table wale naam----------------------------------------------------------------------------------
    mysql.query("Update profilei set picpath=? ,firstname=?,lastname=?,contact=?,gender=?,dob=?,address=?,city=?,state=?,zip=?,fields=?,instagram=?,facebook=?,youtube=?,info=? where eml=?", [fileName, req.body.first, req.body.last, req.body.cnt, req.body.inputGender, req.body.inputDob, req.body.inputAddress, req.body.inputCity, req.body.inputState, req.body.inputZip, req.body.inputFields.toString(), req.body.inputInsta, req.body.inputFb, req.body.inputYt, req.body.inputInfo, req.body.inputeml], function (err, result) {

        if (err == null && result.affectedRows >= 1)
            resp.redirect("result.html");

        else if (err != null)
            resp.send(err.message);

        else resp.send("Invalid Id");
    })
})

app.get("/postbooking-process", function (req, resp) {
    console.log(req.query);

    let mail = req.query.mail;
    let eventtitle = req.query.eventtitle;
    let inputdate = req.query.inputdate;
    let inputtime = req.query.inputtime;
    let inputcity = req.query.inputcity;
    let inputvenue = req.query.inputvenue;

    mysql.query("insert into events values(null,?,?,?,?,?,?)", [mail, eventtitle, inputdate, inputtime, inputcity, inputvenue], function (err) {
        if (err == null) {
            resp.send(" Posted...!")
        }
        else
            resp.send(err.message);
    })
})



app.get("/update-password-process", function (req, resp) {

    let ml = req.query.ml;
    let oldPwd = req.query.old;
    let newPwd = req.query.newpwd;
    let confirm = req.query.confirm;

    if (newPwd !== confirm) {
        return resp.send("Password do not match");
    }

    mysql.query(
        "select pwd from users where email=?",
        [ml],
        function (err, result) {

            if (err || result.length === 0) {
                return resp.send("Invalid user");
            }

            bcrypt.compare(oldPwd, result[0].pwd, function (err, match) {

                if (!match) {
                    return resp.send("Incorrect old password");
                }

                bcrypt.hash(newPwd, 10, function (err, hash) {

                    mysql.query(
                        "update users set pwd=? where email=?",
                        [hash, ml],
                        function () {
                            resp.send("Password changed successfully");
                        }
                    );
                });
            });
        }
    );
});


//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


app.get("/admin-dash", function (req, resp) {
    let path = __dirname + "/public/admin-dash.html";

    resp.sendFile(path);
})

app.get("/admin-users", function (req, resp) {
    let path = __dirname + "/public/admin-users.html";

    resp.sendFile(path);
})

app.get("/fetch-all-emails", function (req, resp) {
    mysql.query("select distinct email from users", function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send(resultJsonAry);//sending array of json object 0-1
    })

})

app.get("/fetch-some", function (req, resp) {
    mysql.query("select * from users where utype=?", [req.query.utype], function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send(resultJsonAry);//sending array of json object 0-1
    })

})

app.get("/fetch-all", function (req, resp) {
    mysql.query("select * from users ", function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send(resultJsonAry);//sending array of json object 0-1
    })

})

app.get("/del-one", function (req, resp) {
    mysql.query("delete from users where email=?", [req.query.email], function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send("Deleted");

    })

})

app.get("/block-one", function (req, resp) {


    mysql.query("update users set status='Blocked' where email=?", [req.query.email], function (err) {
        if (err == null) {
            resp.send("User blocked successfully!");
        }
        else {
            resp.send(err.message);
        }
    });
});

app.get("/resume-one", function (req, resp) {

    mysql.query("update users set status='Active' where email=?", [req.query.email], function (err) {
        if (err == null) {
            resp.send("User resumed successfully!");
        }
        else {
            resp.send(err.message);
        }
    });
});

app.get("/admin-all-infl", function (req, resp) {
    let path = __dirname + "/public/admin-all-infl.html";

    resp.sendFile(path);
})

app.get("/fetch-all-emails-infl", function (req, resp) {
    mysql.query("select distinct email from profilei", function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send(resultJsonAry);//sending array of json object 0-1
    })

})


app.get("/fetch-all-infl", function (req, resp) {
    mysql.query("select * from profilei ", function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send(resultJsonAry);//sending array of json object 0-1
    })

})




//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


app.get("/infl-finder", function (req, resp) {
    let path = __dirname + "/public/infl-finder.html";

    resp.sendFile(path);
})

app.get("/find-influ", function (req, resp) {

    //console.log(req.query.fields);
    mysql.query("select DISTINCT city FROM profilei where fields like ? ", ["%" + req.query.fields + "%"], function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;
        }
        resp.send(resultJsonAry);
    })

})

app.get("/do-find", function (req, resp) {

    //console.log(req.query.fields);
    mysql.query("select * from profilei where fields like ? && city = ? ", ["%" + req.query.fields + "%", req.query.city], function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;
        }
        resp.send(resultJsonAry);
    })

})

app.get("/do-findbyname", function (req, resp) {
    mysql.query("select * from profilei where firstname like ?", ["%" + req.query.firstname + "%"], function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;
        }
        resp.send(resultJsonAry);
    })

})

app.get("/events-manager", function (req, resp) {
    let path = __dirname + "/public/events-manager.html";

    resp.sendFile(path);
})

app.get("/fetch-all-events-details", function (req, resp) {
    mysql.query("select * from events ", function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send(resultJsonAry);//sending array of json object 0-1
    })

})

app.get("/fetch-all-emails-events", function (req, resp) {
    mysql.query("select distinct mail from events", function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send(resultJsonAry);//sending array of json object 0-1
    })

})

app.get("/fetch-some-events", function (req, resp) {
    mysql.query("select * from events where mail=?", [req.query.mail], function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send(resultJsonAry);//sending array of json object 0-1
    })

})

app.get("/del-one-events", function (req, resp) {
    mysql.query("delete from events where rid=?", [req.query.rid], function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send("Deleted");

    })

})

//=====================================================================================================================


app.get("/client-dash", function (req, resp) {
    let path = __dirname + "/public/client-dash.html";

    resp.sendFile(path);
})

app.get("/client-profile", function (req, resp) {
    let path = __dirname + "/public/client-profile.html";

    resp.sendFile(path);
})

app.get("/client-process", function (req, resp) {
    /*
    let fileName = "";
    if (req.files != null) {
        fileName = req.files.ppic.name;
        let path = __dirname + "/public/uploads/" + fileName;
        req.files.ppic.mv(path);
        //req.body.ppic=fileName;
        //resp.send(req.body);
    }
    else
        fileName = "nopic.jpg";

    */
    console.log(req.query);

    mysql.query("insert into profilec values(?,?,?,?,?,?,?)", [req.query.ee, req.query.fullname, req.query.phone, req.query.org, req.query.statee, req.query.cty, req.query.gdr], function (err) {
        if (err == null) {
            resp.redirect("result.html");
        }
        else
            resp.send(err.message);
    })
})



//AJAX CALL RESPONSE
//=================================================================================================================

app.get("/find-client-details", function (req, resp) {
    let ee = req.query.ee;
    mysql.query("select * from profilec where ee=?", [ee], function (err, resultJsonAry) {
        if (err != null) {
            resp.send("Invalid id");
            return;
        }
        console.log(resultJsonAry);
        resp.send(resultJsonAry); // sending array of Json object 0-1
    })
})

app.get("/client-profile-update", function (req, resp) {
    console.log(req.query);

    /*
    let fileName = "";
    if (req.files != null) {
        fileName = req.files.ppic.name;
        let path = __dirname + "/public/uploads/" + fileName;
        req.files.ppic.mv(path);
        //req.body.ppic=fileName;
        //resp.send(req.body);
    }
    else {
        fileName = req.body.hdn;
    }
    */


    //--------------------please use table wale naam----------------------------------------------------------------------------------
    mysql.query("Update profilec set fullname=?,phone=?,org=?,statee=?,cty=?,gdr=? where ee=?", [req.query.fullname, req.query.phone, req.query.org, req.query.statee, req.query.cty, req.query.gdr, req.query.ee], function (err, result) {

        if (err == null && result.affectedRows >= 1)
            resp.redirect("result.html");

        else if (err != null)
            resp.send(err.message);

        else resp.send("Invalid Id");
    })
})



//============================================================================================================================================================================================================================================================================



app.get("/admin-all-clients", function (req, resp) {
    let path = __dirname + "/public/admin-all-clients.html";

    resp.sendFile(path);
})

app.get("/fetch-all-emails-client", function (req, resp) {
    mysql.query("select distinct email from profilec", function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send(resultJsonAry);//sending array of json object 0-1
    })

})


app.get("/fetch-all-client", function (req, resp) {
    mysql.query("select * from profilec ", function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send(resultJsonAry);//sending array of json object 0-1
    })

})



