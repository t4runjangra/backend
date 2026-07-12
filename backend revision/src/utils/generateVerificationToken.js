import crypto from "crypto"

const genereateVerificationToken = () => {


    const rawToken = crypto.randomBytes(32).toString("hex")



    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex")


    const expiry = Date.now() + 30 * 60 * 1000

    return {
        rawToken,
        hashedToken,
        expiry
    }

}


export { genereateVerificationToken }