const jwt = require('jsonwebtoken');



const getJwt = ( uid = '' ) => {

    return new Promise( (resolve, reject) => {

        const payload = { uid };

        jwt.sign( payload, process.env.SECRETORPRIVATEKEY, {
            expiresIn: '4h'
        }, ( err, token ) => {

            if ( err ) {
                console.log(err);
                reject( 'Cannot create JWT' )
            } else {
                resolve( token );
            }
        })

    })
}


module.exports = {
    getJwt
}