const jwt = require('jsonwebtoken');



const getJwt = ( text = '' ) => {

    return new Promise( (resolve, reject) => {

        const payload = { text };

        jwt.sign( payload, process.env.SECRET_OR_PRIVATE_KEY, {
            expiresIn: '8h'
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