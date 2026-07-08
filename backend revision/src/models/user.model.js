import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { type } from "os";
/*
Schema is the blueprint of a MongoDB document.

It defines:
- Which fields a document will have.
- The datatype of each field.
- Validation rules.
- Default values, hooks, methods, virtuals, etc.

A Schema DOES NOT communicate with MongoDB.
It only describes how a document should look.
*/

const userSchema = new mongoose.Schema({

    // Username field
    avatar: {
        url: {
            type: String,
            default: null,
        },
        publicId: {
            type: String,
            default: null,
        },
    },
    coverAvatar: {
        url: {
            type: String,
            default: null
        },
        publicId: {
            type: String,
            default: null,
        },
    },
    username: {
        type: String,          // Data type should be String
        unique: true,          // Creates a unique index (no duplicate usernames)
        required: true,        // This field must exist
        lowercase: true,       // Automatically converts value to lowercase
        trim: true             // Removes whitespace from beginning and end
    },

    // Email field
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    // Password field
    password: {
        type: String,
        required: [true, "Password is required"]
        // Custom validation message if password is missing
    },
    refreshToken: {
        type: String
    }

})

/*
mongoose.model()

Compiles the Schema into a Model.

Schema  --->  Model

The Model:
- Talks to MongoDB.
- Knows which collection to use.
- Has CRUD methods like:
create()
find()
findOne()
updateOne()
deleteOne()
aggregate()

Model is basically a constructor/class.

Using:
const User = mongoose.model("User", userSchema)

Mongoose automatically maps:

User  ---> users collection

(pluralizes the model name)
*/


userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password)

}
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);

    console.log("Pre middleware executed");
});


/*
'this' refers to the CURRENT document
that is being saved.
 
Example:
 
const user = new User({...});
 
await user.save();
 
Inside this middleware:
 
this === user
 
So:
 
this.username
this.email
this.password
 
all belong to that document.
*/
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        id: this._id,
        username: this.username,
        email: this.email
    },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        id: this._id
    },
        process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}


export const User = mongoose.model("User", userSchema);




/*
typeof User === "function"

Why?

Because User is a constructor function (or class).

Example:

const user = new User({...})

creates a Document object.
*/

// console.log(typeof User);
// console.log(User.collection.name);      // users
// console.log(User.schema);
// console.dir(User, { depth: 2 });

/*
Creating a Document

This DOES NOT save anything to MongoDB.

The document only exists inside Node.js memory (RAM).

Mongoose also generates an _id immediately before saving.
*/

// const user = new User({
//     username: "tarun",
//     email: "tarun@gmail.com",
//     password: "123456"
// });

/*
user.isNew

true  -> Document only exists in RAM.
false -> Successfully stored in MongoDB.

new User()
        ↓
Document in RAM
        ↓
user.save()
        ↓
MongoDB
*/

// console.log(user.isNew);

// await user.save();

// console.log(user.isNew);

/*
Mongoose Middleware (Hooks)

Hooks allow us to execute code automatically
before or after certain events.

Examples:
pre("save")
post("save")
pre("validate")
post("find")
etc.

Think of them as event listeners.

Whenever user.save() is called,
this middleware automatically executes FIRST.

Flow:

user.save()
      ↓
Validation
      ↓
pre("save")
      ↓
Insert/Update MongoDB
      ↓
post("save")
*/


/*
Real-world use of pre("save")

Password hashing.

userSchema.pre("save", async function () {

    // Prevent hashing an already hashed password.
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);

});

Why inside middleware instead of controller?

Because every save operation passes through here.

Whether the document is saved from:

- Register Controller
- Admin Controller
- Profile Update
- Any future controller

the password will always be hashed.

This keeps the business rule inside the Model,
preventing developers from accidentally saving
plain-text passwords.
*/




// user.sayHello();