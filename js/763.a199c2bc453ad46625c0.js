"use strict";(self.webpackChunkiquizpros=self.webpackChunkiquizpros||[]).push([[763],{1763:(n,e,t)=>{
t.r(e);
t.d(e,{"PaymentService":()=>r});

class r {
  constructor() {
    this._db = null;
    this._auth = null;
  }

  async initialize() {
    if (window.firebaseServices) {
      this._db   = window.firebaseServices.firestore;
      this._auth = window.firebaseServices.auth;
    }
  }

  /**
   * Verify that a Stripe Checkout session_id corresponds to an active
   * subscription for the current user. Since the Stripe webhook already
   * updated Firestore, we just check the user's subscription tier.
   */
  async verifyPaymentSuccess(sessionId) {
    try {
      if (!this._auth || !this._db) return false;
      const user = this._auth.currentUser;
      if (!user) return false;

      // Poll Firestore up to 5 times (webhook may have a small delay)
      for (let i = 0; i < 5; i++) {
        const doc = await this._db.collection('users').doc(user.uid).get();
        if (doc.exists) {
          const tier = doc.data()?.subscription?.tier;
          if (tier && tier !== 'free') return true;
        }
        if (i < 4) await new Promise(res => setTimeout(res, 1500));
      }
      return false;
    } catch (err) {
      console.warn('PaymentService.verifyPaymentSuccess error:', err);
      return false;
    }
  }
}

}}]);
