import { ApolloServer } from 'apollo-server-express';
import typeDefs from './schema/typeDefs';
import resolvers from './resolvers';
import getUser from '../utils/getUser';

const server = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    context: ({req}) => {
        const token = req.headers.authorization || '';

        const userId = getUser(token); 

        return { userId } 
    }});

export default server;
