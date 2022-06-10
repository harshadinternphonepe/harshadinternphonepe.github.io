function createPhonepePaymentRequest(data){
    if (!window.PaymentRequest) return null;

    var paymentRequestPhonepe = new PaymentRequest([{
            supportedMethods: ["https://mercury.phonepe.com/transact/checkout"],
            data: data
        }], {total: {label: 'Cart Amount', amount: {currency: 'INR', value: '100'}}});
    return paymentRequestPhonepe;
}

function openPhonepeExpressbuy(ppeUrl, handleResponse, handleError) { 
    var data = {
        url: ppeUrl,
    };
    var paymentRequestPhonepe = createPhonepePaymentRequest(data);
    paymentRequestPhonepe.show().then(handlePaymentResponse).catch(handleError);
}

async function getExpressbuyResults(){
    if(sessionStorage.getItem('eligibility') == null)
        await warmupAndSaveResults();
    return {
        'userOperatingSystem': sessionStorage.getItem('userOperatingSystem'),
        'network': sessionStorage.getItem('network'),
        'eligibility': sessionStorage.getItem('eligibilityForExpressbuy'),
        'canMakePayment': sessionStorage.getItem('canMakePayment'),
        'hasEnrolledInstrument': sessionStorage.getItem('hasEnrolledInstrument'),
        'retries': sessionStorage.getItem('hasEnrolledInstrumentRetries'),
        'elapsedTime': sessionStorage.getItem('elapsedTime'),
        'paymentRequestSupported': sessionStorage.getItem('paymentRequestSupported')
    };
}

async function warmupAndSaveResults() {
    if(sessionStorage.getItem('eligibility') != null) return;
    var userOperatingSystem = navigator.userAgentData.platform;
    var network = navigator.connection.effectiveType;
    var isAndroid = false;
    var paymentRequestSupported = false;
    var canMakePayment = false;
    var hasEnrolledInstrument = false;
    var retries = sessionStorage.getItem('hasEnrolledInstrumentRetries') ?? 0;
    var eligibility = false;
    if(userOperatingSystem == "Android")
        isAndroid = true;
    
    var data = {
        url: "ppe://expressbuy"
    }
    var paymentRequestPhonepe = createPhonepePaymentRequest(data);
    if(isAndroid && paymentRequestPhonepe != null)
    {
        paymentRequestSupported = true;
        canMakePayment = await paymentRequestPhonepe.canMakePayment();
        startTime = performance.now();
        while(canMakePayment == true && retries < 12 && hasEnrolledInstrument == false)
        {
            hasEnrolledInstrument = await paymentRequestPhonepe.hasEnrolledInstrument()
            if(hasEnrolledInstrument) break;
            paymentRequestPhonepe = createPhonepePaymentRequest(data);
            retries++;
        }
        endTime = performance.now();
        var elapsedTime = endTime - startTime;
    }
    eligibility = isAndroid && paymentRequestSupported && canMakePayment && hasEnrolledInstrument;
    sessionStorage.setItem('hasEnrolledInstrumentRetries', retries);
    sessionStorage.setItem('eligibilityForExpressbuy', eligibility);
    sessionStorage.setItem('userOperatingSystem', userOperatingSystem);
    sessionStorage.setItem('paymentRequestSupported', paymentRequestSupported);
    sessionStorage.setItem('hasEnrolledInstrument', hasEnrolledInstrument);
    sessionStorage.setItem('elapsedTime', elapsedTime);
    sessionStorage.setItem('canMakePayment', canMakePayment);
    sessionStorage.setItem('network', network);
}
