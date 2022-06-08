function createPhonepePaymentRequest(data){
    if (!window.PaymentRequest) return null;

    var paymentRequestPhonepe = new PaymentRequest([{
            supportedMethods: ["https://mercury-stg.phonepe.com/transact/checkout"],
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

async function expressbuyResults(){
    var userAgent = navigator.userAgent.toLowerCase();
    var userOperatingSystem = navigator.userAgentData.platform;
    var canShowExpressbuy = true;
    var network = navigator.connection.effectiveType;
    var Android = userAgent.indexOf("android") > -1;
    if(!Android) canShowExpressbuy = false;
    
    var data = {
        url: "ppe://expressbuy"
    }
    var paymentRequestPhonepe = createPhonepePaymentRequest(data);
    if(paymentRequestPhonepe == null){
        canShowExpressbuy = false;
    }
    var canMakePayment = await paymentRequestPhonepe.canMakePayment();
    if(canMakePayment == false){ // don't try hasEnrolledInstrument
        return {
        'userOperatingSystem': userOperatingSystem,
        'network': network,
        'canShowExpressbuy': false,
        'canMakePayment': canMakePayment,
        'hasEnrolledInstrument': false,
        'numberOfRetries': 0,
        'timeTakenToDisplay': 0
        };
    }
    var hasEnrolledInstrument = false;
    var counter = 0;
    var startTime, endTime;
    startTime = performance.now();
    while(counter < 25 && hasEnrolledInstrument == false)
    {
        hasEnrolledInstrument = await paymentRequestPhonepe.hasEnrolledInstrument()
        if(hasEnrolledInstrument) break;
        paymentRequestPhonepe = createPhonepePaymentRequest(data);
        counter++;
    }
    endTime = performance.now();
    var numberOfRetries = counter;
    var timeTakenToDisplay = endTime - startTime;
    canShowExpressbuy = canShowExpressbuy && canMakePayment && hasEnrolledInstrument;
    return {
        'userOperatingSystem': userOperatingSystem,
        'network': network,
        'canShowExpressbuy': canShowExpressbuy,
        'canMakePayment': canMakePayment,
        'hasEnrolledInstrument': hasEnrolledInstrument,
        'numberOfRetries': numberOfRetries,
        'timeTakenToDisplay': timeTakenToDisplay
    };
}

async function canShowExpressBuy() {
    var userAgent = navigator.userAgent.toLowerCase();
    var Android = userAgent.indexOf("android") > -1;
    if(!Android) return false;
    
    var data = {
        url: "ppe://expressbuy"
    }
    console.log("constraints = " + JSON.stringify(data["constraints"]));
    let valid;
    var paymentRequestPhonepe = createPhonepePaymentRequest(data);
    if(paymentRequestPhonepe == null) return false;
    else valid = true;
    if(valid) console.log('payment request obj created');
    valid = valid && await paymentRequestPhonepe.canMakePayment();
    let hasEnrolledInstrument = false;
    let counter = 0;
    var startTime, endTime;
    while(counter < 25 && hasEnrolledInstrument == false)
    {
        hasEnrolledInstrument = await paymentRequestPhonepe.hasEnrolledInstrument()
        if(hasEnrolledInstrument) break;
        console.log('hasEnrolledInstrument: ' + counter + '-' + hasEnrolledInstrument);
        paymentRequestPhonepe = createPhonepePaymentRequest(data);
        counter++;
    }
    console.log('loop exited');
    return valid && hasEnrolledInstrument;
}
