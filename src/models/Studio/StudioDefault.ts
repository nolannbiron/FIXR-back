import mongoose, { Schema } from 'mongoose'
import { Request } from '../../common'
import ModelUtils from '../../utils/ModelsUtils'
import { IUser } from '../User/types'
import Studio from './Studio'
import { IStudio, StudioModel } from './types'

export default function (StudioSchema: Schema<IStudio, StudioModel>) {
    StudioSchema.pre('validate', async function (next) {
        // const studio = this
        next()
    })
    StudioSchema.pre('save', async function (next) {
        // const studio = this

        next()
    })
    /** ----------------------- Create ----------------------- */
    StudioSchema.statics.createStudio = async function (req) {
        /** Handle req, used by routers */
        const body = req.body

        return mongoose.model<IStudio, StudioModel>('studio').createModel({
            ...body,
            owner: req.user._id,
        })
    }
    StudioSchema.statics.createModel = async function (data: IStudio) {
        /** Only create model, intern used only */
        const studioId = new mongoose.Types.ObjectId()
        const userToken = await Studio.generateToken(studioId.toString(), false)
        const adminToken = await Studio.generateToken(studioId.toString(), true)

        const studio = await ModelUtils.createHandler(
            new Studio({
                _id: studioId,
                name: data.name ? data.name : undefined,
                owner: data.owner,
                userToken,
                adminToken,
            })
        )
        /** Studio post created */
        if (studio) {
            const user = await mongoose.model<IUser>('user').findOne({ _id: data.owner })
            if (!user) throw new Error('Studio invalid owner')
            user.studios.push(studio.id)
            await user.save()
        }

        return studio
    }

    /** ----------------------- Edit ----------------------- */
    StudioSchema.methods.edit = async function (req: Request) {
        const { name, phone, owner } = req.body
        const studio = this

        console.log(req.body)

        studio.editValue(req, name, 'name')
        studio.editValue(req, owner, 'owner')
        studio.editValue(req, phone, 'phone')

        await studio.save()
    }

    /** ----------------------- Delete ----------------------- */
    StudioSchema.methods.delete = async function () {
        const studio = this

        if (studio._isDeleted) return
        studio._isDeleted = true

        const userQuery = {
            $or: [{ studios: { $exists: false } }, { studios: { $size: 0 } }],
            'profile.permissionLevel': { $gt: 0 },
        }

        await mongoose.model('user').updateMany({ studios: studio._id }, { $pull: { studios: studio._id } })
        /** Delete user if user isn't root & user hasn't studio */
        await mongoose.model('user').deleteMany(userQuery) /** DO NOT MOVE IN ASYNC ARRAY */

        /** Delete studio */
        if (!(await mongoose.model('studio').findOneAndDelete({ _id: studio._id }))) throw { message: 'Delete failed' }
    }
}
