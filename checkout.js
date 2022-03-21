async function phonepeHasEnrolledInstrument(paymentRequestPhonepe) {
    if (paymentRequestPhonepe) {
        let result = await paymentRequestPhonepe.hasEnrolledInstrument().catch((err) => {console.log(err); return false;})
        return result;
    }
    return false;
}

async function phonepeCanMakePayment(paymentRequestPhonepe) {
    if (paymentRequestPhonepe) {
    let result = await paymentRequestPhonepe.canMakePayment().catch((err) => {console.log(err); return false;})
        return result;
    }
    return false;
}

function createPhonepePaymentRequest(data){
    if (!window.PaymentRequest) return null;

    var paymentRequestPhonepe = new PaymentRequest([{
            supportedMethods: ["https://mercury-stg.phonepe.com/transact/pay"],
            data: data
        }], {total: {label: 'Cart Amount', amount: {currency: 'INR', value: '100'}}});
    return paymentRequestPhonepe;
}

function openPhonepeExpressbuy(ppeUrl, handleResponse, handleError) { 
    console.log(ppeUrl);
    var data = {
        url: ppeUrl,
    };
    var paymentRequestPhonepe = createPhonepePaymentRequest(data);
    console.log(paymentRequestPhonepe);
    paymentRequestPhonepe.show().then(handlePaymentResponse).catch(handleError);
}

async function canShowExpressBuy() {
    var userAgent = navigator.userAgent.toLowerCase();
    var Android = userAgent.indexOf("android") > -1;
    if(!Android) return false;
    
    var data = {
        url: "ppe://expressbuy",
        constraints: ['COUPON']
    }
    let valid;
    var paymentRequestPhonepe = createPhonepePaymentRequest(data);
    if(paymentRequestPhonepe == null) valid = false;
    else valid = true;
    valid = valid && await phonepeCanMakePayment(paymentRequestPhonepe);
    valid = valid && await phonepeHasEnrolledInstrument(paymentRequestPhonepe);
    return valid;
}
