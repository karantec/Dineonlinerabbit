import { connectDB } from '@/lib/db';
import { RestaurantModel } from '@/lib/models';
import { requireAuth, json } from '@/lib/auth';
import { isLive } from '@/lib/subscription';
import { validType, buildSubscription, applySubscription, ensureOwner } from '@/lib/provision';

/*
 body: { action, ... }
   approve | activate | reactivate | renew : { plan: 'trial'|'yearly'|'keep', amount, startDate, businessType }
        'trial'  = 1 month from startDate, no amount
        'yearly' = exactly 1 year from startDate, amount required
        'keep'   = just re-enable, keeping the current (still valid) subscription
   reject | suspend : { reason }
   update : { businessType }
*/
export async function PATCH(req, { params }) {
  const { error } = await requireAuth(['superadmin']);
  if (error) return error;
  await connectDB();
  const { id } = await params;
  const b = await req.json();
  const r = await RestaurantModel.findById(id);
  if (!r) return json({ error: 'Not found' }, 404);

  if (b.businessType && validType(b.businessType)) r.businessType = b.businessType;

  switch (b.action) {
    case 'approve': case 'activate': case 'reactivate': case 'renew': {
      if (b.plan === 'keep') {
        if (!isLive({ status: 'active', subscription: r.subscription })) return json({ error: 'The current subscription has expired. Choose a new plan.' }, 400);
        r.status = 'active'; r.statusReason = undefined;
      } else {
        const { sub, error: planError } = buildSubscription(b);
        if (planError) return json({ error: planError }, 400);
        applySubscription(r, sub);
      }
      await r.save();
      const owner = await ensureOwner(r); // only creates a login + email the first time
      return json({ restaurant: r, ownerCreated: owner.created, emailSent: owner.emailSent, tempPassword: owner.tempPassword });
    }
    case 'reject': r.status = 'rejected'; r.statusReason = b.reason; break;
    case 'suspend': r.status = 'suspended'; r.statusReason = b.reason; break;
    case 'update': break;
    default: return json({ error: 'Bad action' }, 400);
  }
  await r.save();
  return json({ restaurant: r });
}
