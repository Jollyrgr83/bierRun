// CUSTOMERPAGE
// react
import React, { useState, useEffect } from "react";
// stylesheet
import "./CustomerPage.css";
// API functions
import API from "../../util/API";
// utility functions
import customerPageUtil from "../../util/customerPageUtil";
// authentication
import { useAuth0 } from "@auth0/auth0-react";
// modal component from react-modal package
import Modal from "react-modal";
// style attributes for modal window
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

Modal.setAppElement("#root");

function CustomerPage() {
  // authentication
  const { user, isAuthenticated, loading } = useAuth0();
  // inventory elements (logos, names, and quantity options)
  const [inventory, setInventory] = useState({ images: [], beers: {} });
  // beer selection modal open state
  const [isOpen, setIsOpen] = useState(false);
  // beer name, inventory, and quantity options for the selected beer modal
  const [modalState, setModalState] = useState({
    modalName: "",
    modalInventory: [],
  });
  // order details for shopping cart
  const [order, setOrder] = useState({
    order: [],
    totalItems: 0,
    totalPrice: 0,
  });
  // user info for welcome message in top row
  const [welcomeMessage, setWelcomeMessage] = useState({
    username: "",
    address: "",
  });
  // order info for order status message in top row
  const [orderMessage, setOrderMessage] = useState({
    text: "",
    orderID: "",
    arrivalTime: "",
  });
  // order info for shopping cart message after submitting order
  const [placeOrderMessage, setPlaceOrderMessage] = useState({
    text: "",
    isShow: false,
  });
  // enter address modal open state 
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  // user input for delivery address from enter address modal
  const [addressInfo, setAddressInfo] = useState({
    street: "",
    city: "",
    state: "",
    zip: ""
  });
  // useEffect to load beer inventory from API on page load
  useEffect(() => {
    // TROUBLESHOOTING PAGE LOAD AND LOGIN ISSUES HERE******
    // const doSomething = async () => {
    //   console.log(isAuthenticated);
    // };
    // if (!loading) {
    //   doSomething();
    //   loadInventory();
    // }
    loadInventory();
  }, []);

  function loadUserWelcome() {
    API.getUserData().then((res) => {});
  }

  function loadUserOrderMessage() {
    API.getUserOrderData().then((res) => {});
  }

  function loadInventory() {
    console.log("isAuthenticated before setInventory: ", isAuthenticated);
    API.getInventory().then((res) => {
      setInventory({
        images: [...API.images],
        beers: res,
      });
      console.log("isAuthenticated after setInventory: ", isAuthenticated);
    });
  }
  // capture user inputs from enter address modal
  function handleInputChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    setAddressInfo({
      [name]: value
    });
  }
  // handles beer selection modal open/close
  function toggleModal(event) {
    if (!isOpen) {
      renderModal(event.target.alt);
    }
    setIsOpen(!isOpen);
  }
  // handles enter address modal open/close
  function toggleAddressModal(event) {
    setIsAddressModalOpen(!isAddressModalOpen);
  }
  // renders beer selection modal based on selection 
  function renderModal(beerName) {
    setModalState({
      modalName: beerName,
      modalInventory: [...inventory.beers[beerName]],
    });
  }
  // uses util functions to convert order selections to shopping cart object
  function handleModalFormSubmit(e) {
    e.preventDefault();
    const addToOrderObj = customerPageUtil.addToOrderInstance();
    const orderJSON = customerPageUtil.toSimpleJSON(addToOrderObj);
    const updateArr = customerPageUtil.removeBlankEntries(orderJSON);
    const fullOrderArray = [...order.order, ...updateArr];
    let tempTotalItems = 0;
    let tempTotalPrice = 0;
    for (let i = 0; i < fullOrderArray.length; i++) {
      tempTotalItems += parseInt(fullOrderArray[i].quantity);
      tempTotalPrice += parseFloat(fullOrderArray[i].subtotal);
    }
    setOrder({
      order: [...fullOrderArray],
      totalItems: tempTotalItems,
      totalPrice: tempTotalPrice,
    });

    toggleModal();
  }
  // captures shopping cart object and sends to API
  function placeOrder(e) {
    e.preventDefault();
    if (order.totalItems === 0) {
      return;
    } else {
      const orderDetails = JSON.stringify(order.order);
      const orderObj = {
        orderDetails: orderDetails,
        totalPrice: order.totalPrice,
        totalItems: order.totalItems,
        customerID: "testCustomerID",
      };
      API.sendOrder(orderObj).then((res) => {
        console.log("sendOrder res", res);
        setPlaceOrderMessage({
          isShow: true,
          text: `Your order has been placed. Your order ID is: ${res.data._id}`,
        });
      });
    }
  }
  // page render
  return (
    // protected route - only renders after successful login
    isAuthenticated && (
      <div className="main-container">
        <div className="row message-container">
          <div className="col-sm-8">
            <p className="welcome">
              Welcome {user.name}, your address is: [user address]
            </p>
          </div>
          <div className="col-sm-4">
            <p className="welcome">
              Your order [order ID] should arrive at [arrival time].
            </p>
          </div>
        </div>
        <Modal
          isOpen={isOpen}
          onRequestClose={toggleModal}
          contentLabel="Inventory Order Screen"
          style={customStyles}
        >
          <form id="modalForm" className="text-center mx-auto">
            <div className="modal-title mx-auto">{modalState.modalName}</div>
            {modalState.modalInventory.map((x) => {
              return (
                <div className="row modal-row mx-auto" key={x.id}>
                  <p className="modal-item mx-auto">{x.quantity}</p>
                  <p className="modal-item mx-auto">${x.price}</p>
                  <input
                    name={`${modalState.modalName},${x.quantity},${x.price}`}
                    type="number"
                    className="modal-item mx-auto"
                  />
                </div>
              );
            })}
            <div className="row modal-footer">
              <button className="modalButton cancel" onClick={toggleModal}>
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleModalFormSubmit}
                className="modalButton addToCart"
              >
                Add to Cart
              </button>
            </div>
          </form>
        </Modal>
        <Modal
          isOpen={isAddressModalOpen}
          onRequestClose={toggleAddressModal}
          contentLabel="Enter Address Screen"
          style={customStyles}
        >
          <div>
            <div className="address-modal-title">Enter Your Address:</div>
            <div className="address-modal-label">Street Address:</div>
            <input className="address-modal-input" name="street" type="text" onChange={handleInputChange} />
            <div className="address-modal-label">City:</div>
            <input className="address-modal-input" name="city" type="text" onChange={handleInputChange} />
            <div className="address-modal-label">State:</div>
            <input className="address-modal-input" name="state" type="text" onChange={handleInputChange} />
            <div className="address-modal-label">Zip Code:</div>
            <input className="address-modal-input" name="zip" type="text" onChange={handleInputChange} />
          
          </div>
        </Modal>
        <div className="row customer-background">
          <div className="col-sm-8">
            <div className="row text-center">
              {inventory.images.map((x) => {
                return (
                  <img
                    key={x.id}
                    src={x.logo}
                    alt={x.name}
                    className="inventory-card mx-auto"
                    onClick={toggleModal}
                  />
                );
              })}
            </div>
          </div>
          <div className="col-sm-4 mx-auto">
            <div className="shopping-cart">
              <p className="cart-title">Shopping Cart</p>
              {order.order.map((x) => {
                return (
                  <div key={x.id}>
                    <hr></hr>
                    <p className="cart-sub">Item: {`${x.name}`}</p>
                    <p className="cart-sub">Quantity: {x.quantity}</p>
                    <p className="cart-sub">Subtotal: {x.subtotal}</p>
                  </div>
                );
              })}
              <div className="cart-total">
                <hr></hr>
                <p>Total Items: {order.totalItems}</p>
                <p>Total: ${order.totalPrice.toFixed(2)}</p>
                <button className="orderButton" onClick={toggleAddressModal}>
                  Place Order
                </button>
                <p
                  className={
                    placeOrderMessage.isShow
                      ? "placeOrderMessage show"
                      : "placeOrderMessage hide"
                  }
                >
                  {placeOrderMessage.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default CustomerPage;
