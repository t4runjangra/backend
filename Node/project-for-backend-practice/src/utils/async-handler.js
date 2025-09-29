//here i used a higher order function to to handle the requests 

// inside this asyncHandler i take a referenece of a function means when ever i call this function while sending the request the reference will going to pass down here and further going to use it to handle the requst 

// so this is a high order function as we know about it returns a function too. the working of the function here is i take three parameters here request response and next  and inside that i am using a promise to resolve my request if it resolve it it will return the values of it and if it not it will throw an error basic promise working of it.

const asyncHandler = (requestHandler) =>{
    return (req, res , next) =>{
        Promise
        .resolve(requestHandler(req, res, next))
        .catch((err)=>{
            next(err)
        })
    }
}

// exported this function so that i can use it further 
export {asyncHandler}