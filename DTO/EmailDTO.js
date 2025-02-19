import Yup from 'yup';

export class EmailDTO {

    constructor(name, email, object, context) {
        this.name = name;
        this.email = email;
        this.object = object;
        this.context = context;
    }

    static validationSchema() {
        return Yup.object({
            name: Yup.string().required('Name is required!'),
            email: Yup.string().email('Invalid email format').required('Email is required!'),
            object: Yup.string().required('Object email is required!'),
            context: Yup.string().required('Message content is required!')
        });
    }

    async validate() {
        const schema = EmailDTO.validationSchema();
        await schema.validate(this);
    }
}