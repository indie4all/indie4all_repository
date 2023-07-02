const jwt = require('jsonwebtoken');



const getJwt = ( uid = '' ) => {

    return new Promise( (resolve, reject) => {

        const payload = { uid };

        jwt.sign( payload, process.env.SECRET_OR_PRIVATE_KEY, {
            expiresIn: '4h'
        }, ( err, token ) => {

            if ( err ) {
                console.error(err);
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