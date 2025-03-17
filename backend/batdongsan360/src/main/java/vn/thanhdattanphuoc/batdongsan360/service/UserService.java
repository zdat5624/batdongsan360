package vn.thanhdattanphuoc.batdongsan360.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.domain.request.CreateUserDTO;
import vn.thanhdattanphuoc.batdongsan360.domain.request.UserUpdateDTO;
import vn.thanhdattanphuoc.batdongsan360.repository.UserRepository;

@Service
public class UserService {

    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User handleCreateUser(CreateUserDTO createUserDTO) {
        User user = new User();
        user.setName(createUserDTO.getName());
        user.setPhone(createUserDTO.getPhone());
        user.setEmail(createUserDTO.getEmail());
        user.setPassword(createUserDTO.getPassword());
        user.setRole(createUserDTO.getRole());
        return this.userRepository.save(user);
    }

    public User handleCreateUser(User user) {

        return this.userRepository.save(user);
    }

    public void handleDeleteUser(long id) {
        this.userRepository.deleteById(id);
    }

    public User fetchUserById(long id) {
        Optional<User> userOptional = this.userRepository.findById(id);
        if (userOptional.isPresent()) {
            return userOptional.get();
        }
        return null;
    }

    public User handleGetUserByUserName(String username) {
        Optional<User> userOptional = this.userRepository.findByEmail(username);
        if (userOptional.isPresent()) {
            return userOptional.get();
        }
        return null;
    }

    public List<User> fetchAllUser() {
        return this.userRepository.findAll();
    }

    public User handleUpdateUser(UserUpdateDTO userUpdateDTO) {
        User currentUser = fetchUserById(userUpdateDTO.getId());
        if (currentUser != null) {
            currentUser.setName(userUpdateDTO.getName());
            currentUser.setEmail(userUpdateDTO.getEmail());
            currentUser.setRole(userUpdateDTO.getRole());
            currentUser.setGender(userUpdateDTO.getGender());
            currentUser.setBalance(userUpdateDTO.getBalance());
            currentUser.setAvatar(userUpdateDTO.getAvatar());
            currentUser.setPhone(userUpdateDTO.getPhone());
            currentUser.setAddress(userUpdateDTO.getAddress());
            return currentUser = this.userRepository.save(currentUser);
        }
        return null;
    }

    public boolean isEmailExist(String email) {
        return this.userRepository.existsByEmail(email);
    }
}
